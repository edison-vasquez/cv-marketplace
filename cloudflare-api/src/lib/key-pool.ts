/**
 * Roboflow API Key Pool
 * Manages multiple Roboflow API keys for seamless demo inference.
 * Selects the least-used healthy key, handles failures with cooldown,
 * and retries with alternate keys automatically.
 */

interface RoboflowKeyRow {
  id: string;
  api_key: string;
  label: string;
  daily_usage: number;
  daily_limit: number;
  monthly_usage: number;
  monthly_limit: number;
  is_active: number;
  is_healthy: number;
  consecutive_failures: number;
  cooldown_until: string | null;
  priority: number;
}

interface RoboflowResponse {
  predictions: any[];
  time?: number;
  image?: { width: number; height: number };
}

interface KeyPoolDeps {
  db: D1Database;
  kv: KVNamespace;
}

const KV_CACHE_KEY = 'rfpool:best_key';
const KV_CACHE_TTL = 10; // seconds

export class RoboflowKeyPool {
  constructor(private deps: KeyPoolDeps) {}

  /**
   * Select the best available key from the pool.
   * Uses KV cache to avoid hitting D1 on every request.
   */
  async acquireKey(excludeIds: string[] = []): Promise<{ id: string; apiKey: string } | null> {
    // Try KV cache first (only if no exclusions)
    if (excludeIds.length === 0) {
      const cached = await this.deps.kv.get(KV_CACHE_KEY);
      if (cached) {
        try {
          const { id, apiKey } = JSON.parse(cached);
          return { id, apiKey };
        } catch {}
      }
    }

    // Query D1 for the best key
    const now = new Date().toISOString();
    const excludePlaceholders = excludeIds.length > 0
      ? `AND id NOT IN (${excludeIds.map(() => '?').join(',')})`
      : '';

    const query = `
      SELECT id, api_key, daily_usage, daily_limit, monthly_usage, monthly_limit
      FROM roboflow_keys
      WHERE is_active = 1
        AND is_healthy = 1
        AND daily_usage < daily_limit
        AND monthly_usage < monthly_limit
        AND (cooldown_until IS NULL OR cooldown_until < ?)
        ${excludePlaceholders}
      ORDER BY priority DESC, daily_usage ASC, last_used_at ASC
      LIMIT 1
    `;

    const bindings = [now, ...excludeIds];
    const row = await this.deps.db.prepare(query).bind(...bindings).first<RoboflowKeyRow>();

    if (!row) return null;

    const result = { id: row.id, apiKey: row.api_key };

    // Cache in KV (only if no exclusions)
    if (excludeIds.length === 0) {
      await this.deps.kv.put(KV_CACHE_KEY, JSON.stringify(result), { expirationTtl: KV_CACHE_TTL });
    }

    return result;
  }

  /**
   * Report successful usage. Increments counters.
   */
  async reportSuccess(keyId: string): Promise<void> {
    await this.deps.db.prepare(`
      UPDATE roboflow_keys
      SET daily_usage = daily_usage + 1,
          monthly_usage = monthly_usage + 1,
          last_used_at = CURRENT_TIMESTAMP,
          consecutive_failures = 0,
          is_healthy = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(keyId).run();
  }

  /**
   * Report failure. Handles cooldown and auto-disable logic.
   */
  async reportFailure(keyId: string, httpStatus: number, errorMessage: string): Promise<void> {
    // Invalidate KV cache
    await this.deps.kv.delete(KV_CACHE_KEY);

    if (httpStatus === 401) {
      // Invalid key - permanently disable
      await this.deps.db.prepare(`
        UPDATE roboflow_keys
        SET is_active = 0, last_error = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(errorMessage, keyId).run();
      return;
    }

    // Get current failure count
    const row = await this.deps.db.prepare(
      'SELECT consecutive_failures FROM roboflow_keys WHERE id = ?'
    ).bind(keyId).first<{ consecutive_failures: number }>();

    const failures = (row?.consecutive_failures || 0) + 1;

    if (httpStatus === 429 || httpStatus === 402) {
      // Rate limited or billing issue - cooldown 1 hour
      const cooldownUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await this.deps.db.prepare(`
        UPDATE roboflow_keys
        SET is_healthy = 0, cooldown_until = ?, consecutive_failures = ?,
            last_error = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(cooldownUntil, failures, errorMessage, keyId).run();
    } else if (failures >= 3) {
      // 3+ consecutive failures - cooldown 30 minutes
      const cooldownUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await this.deps.db.prepare(`
        UPDATE roboflow_keys
        SET is_healthy = 0, cooldown_until = ?, consecutive_failures = ?,
            last_error = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(cooldownUntil, failures, errorMessage, keyId).run();
    } else {
      // Increment failure counter
      await this.deps.db.prepare(`
        UPDATE roboflow_keys
        SET consecutive_failures = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(failures, errorMessage, keyId).run();
    }
  }

  /**
   * Execute inference with automatic retry across different keys.
   */
  async executeWithRetry(
    roboflowId: string,
    roboflowVersion: number,
    roboflowModelType: string | null,
    imageBase64: string,
    maxRetries: number = 2
  ): Promise<RoboflowResponse> {
    const excludeIds: string[] = [];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const key = await this.acquireKey(excludeIds);
      if (!key) {
        throw new Error('No hay API keys disponibles en el pool. Todos los keys están agotados o en cooldown.');
      }

      try {
        const result = await this.callRoboflow(roboflowId, roboflowVersion, roboflowModelType, imageBase64, key.apiKey);
        await this.reportSuccess(key.id);
        return result;
      } catch (err: any) {
        const status = err.httpStatus || 500;
        await this.reportFailure(key.id, status, err.message || 'Unknown error');
        excludeIds.push(key.id);

        if (attempt === maxRetries) {
          throw new Error(`Inferencia falló después de ${maxRetries + 1} intentos: ${err.message}`);
        }
      }
    }

    throw new Error('Pool de keys agotado');
  }

  /**
   * Call the Roboflow API.
   */
  private async callRoboflow(
    roboflowId: string,
    version: number,
    modelType: string | null,
    imageBase64: string,
    apiKey: string
  ): Promise<RoboflowResponse> {
    // Determine the correct Roboflow endpoint based on model type
    const baseUrl = this.getRoboflowBaseUrl(modelType);
    const url = `${baseUrl}/${roboflowId}/${version}?api_key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      body: imageBase64,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error: any = new Error(`Roboflow API error: ${errorText}`);
      error.httpStatus = response.status;
      throw error;
    }

    const data = await response.json() as any;

    return {
      predictions: data.predictions || [],
      time: data.time,
      image: data.image,
    };
  }

  private getRoboflowBaseUrl(modelType: string | null): string {
    switch (modelType?.toLowerCase()) {
      case 'classification':
        return 'https://classify.roboflow.com';
      case 'segmentation':
      case 'instance-segmentation':
        return 'https://segment.roboflow.com';
      default:
        return 'https://detect.roboflow.com';
    }
  }

  /**
   * Reset daily counters (called by cron).
   */
  async resetDailyCounters(): Promise<void> {
    await this.deps.db.prepare(`
      UPDATE roboflow_keys SET daily_usage = 0, updated_at = CURRENT_TIMESTAMP
    `).run();

    // Also re-enable keys that were in cooldown
    await this.deps.db.prepare(`
      UPDATE roboflow_keys
      SET is_healthy = 1, cooldown_until = NULL, consecutive_failures = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE is_active = 1 AND is_healthy = 0
    `).run();

    await this.deps.kv.delete(KV_CACHE_KEY);
  }

  /**
   * Reset monthly counters (called by cron).
   */
  async resetMonthlyCounters(): Promise<void> {
    await this.deps.db.prepare(`
      UPDATE roboflow_keys SET monthly_usage = 0, updated_at = CURRENT_TIMESTAMP
    `).run();
    await this.deps.kv.delete(KV_CACHE_KEY);
  }

  /**
   * Get pool statistics.
   */
  async getStats(): Promise<any> {
    const all = await this.deps.db.prepare(`
      SELECT id, label, roboflow_account, daily_usage, daily_limit,
             monthly_usage, monthly_limit, is_active, is_healthy,
             consecutive_failures, cooldown_until, priority, last_used_at, last_error
      FROM roboflow_keys
      ORDER BY priority DESC, label ASC
    `).all();

    const keys = all.results || [];
    const active = keys.filter((k: any) => k.is_active === 1);
    const healthy = active.filter((k: any) => k.is_healthy === 1);
    const totalDailyCapacity = active.reduce((sum: number, k: any) => sum + k.daily_limit, 0);
    const totalDailyUsed = active.reduce((sum: number, k: any) => sum + k.daily_usage, 0);

    return {
      totalKeys: keys.length,
      activeKeys: active.length,
      healthyKeys: healthy.length,
      dailyCapacity: totalDailyCapacity,
      dailyUsed: totalDailyUsed,
      dailyRemaining: totalDailyCapacity - totalDailyUsed,
      keys: keys.map((k: any) => ({
        id: k.id,
        label: k.label,
        account: k.roboflow_account,
        dailyUsage: `${k.daily_usage}/${k.daily_limit}`,
        monthlyUsage: `${k.monthly_usage}/${k.monthly_limit}`,
        isActive: k.is_active === 1,
        isHealthy: k.is_healthy === 1,
        failures: k.consecutive_failures,
        cooldownUntil: k.cooldown_until,
        lastUsed: k.last_used_at,
        lastError: k.last_error,
      })),
    };
  }
}
