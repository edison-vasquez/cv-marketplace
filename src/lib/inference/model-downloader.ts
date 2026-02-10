// Descargador de modelos con progreso

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Descarga un archivo con seguimiento de progreso
 */
export async function downloadWithProgress(
  url: string,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error descargando: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  // Si no hay content-length, descargar directamente
  if (!total || !response.body) {
    const blob = await response.blob();
    onProgress?.({ loaded: blob.size, total: blob.size, percentage: 100 });
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;

    const percentage = Math.round((loaded / total) * 100);
    onProgress?.({ loaded, total, percentage });
  }

  // Combinar chunks en un solo Blob
  const blob = new Blob(chunks as BlobPart[]);
  return blob;
}

/**
 * Descarga un modelo con retry automático
 */
export async function downloadModelWithRetry(
  url: string,
  onProgress?: ProgressCallback,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Blob> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📥 Intento ${attempt}/${maxRetries} descargando modelo...`);
      return await downloadWithProgress(url, onProgress);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Intento ${attempt} falló: ${lastError.message}`);

      if (attempt < maxRetries) {
        await sleep(retryDelay * attempt); // Backoff exponencial
      }
    }
  }

  throw lastError || new Error('Descarga fallida después de reintentos');
}

/**
 * Verifica si una URL es accesible (HEAD request)
 */
export async function checkModelAvailability(url: string): Promise<{
  available: boolean;
  size?: number;
  contentType?: string;
}> {
  try {
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      return { available: false };
    }

    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');

    return {
      available: true,
      size: contentLength ? parseInt(contentLength, 10) : undefined,
      contentType: contentType || undefined,
    };
  } catch {
    return { available: false };
  }
}

/**
 * Formatea bytes a string legible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Estima tiempo restante de descarga
 */
export function estimateTimeRemaining(
  loaded: number,
  total: number,
  elapsedMs: number
): string {
  if (loaded === 0) return 'Calculando...';

  const bytesPerMs = loaded / elapsedMs;
  const remainingBytes = total - loaded;
  const remainingMs = remainingBytes / bytesPerMs;

  if (remainingMs < 1000) return 'Menos de 1 segundo';
  if (remainingMs < 60000) return `${Math.ceil(remainingMs / 1000)} segundos`;
  return `${Math.ceil(remainingMs / 60000)} minutos`;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clase para manejar la descarga con estado
 */
export class ModelDownloader {
  private abortController: AbortController | null = null;
  private startTime: number = 0;

  /**
   * Inicia la descarga de un modelo
   */
  async download(
    url: string,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    this.abortController = new AbortController();
    this.startTime = Date.now();

    try {
      const response = await fetch(url, {
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        return await response.blob();
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        const percentage = total ? Math.round((loaded / total) * 100) : 0;
        onProgress?.({ loaded, total, percentage });
      }

      return new Blob(chunks as BlobPart[]);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancela la descarga en progreso
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Obtiene el tiempo transcurrido
   */
  getElapsedTime(): number {
    return this.startTime ? Date.now() - this.startTime : 0;
  }
}

export default ModelDownloader;
