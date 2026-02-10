// Sistema de caché de modelos con IndexedDB

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ModelCacheDB extends DBSchema {
  models: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      size: number;
      timestamp: number;
      version: string;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'visionhub-models';
const DB_VERSION = 1;
const STORE_NAME = 'models';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB límite de caché

let dbInstance: IDBPDatabase<ModelCacheDB> | null = null;

/**
 * Abre la conexión a IndexedDB
 */
async function getDB(): Promise<IDBPDatabase<ModelCacheDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ModelCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-timestamp', 'timestamp');
    },
  });

  return dbInstance;
}

/**
 * Obtiene un modelo del caché
 */
export async function getCachedModel(
  modelId: string
): Promise<{ blob: Blob; blobUrl: string } | null> {
  try {
    const db = await getDB();
    const cached = await db.get(STORE_NAME, modelId);

    if (cached) {
      // Actualizar timestamp de acceso
      await db.put(STORE_NAME, {
        ...cached,
        timestamp: Date.now(),
      });

      return {
        blob: cached.blob,
        blobUrl: URL.createObjectURL(cached.blob),
      };
    }

    return null;
  } catch (error) {
    console.error('Error leyendo caché:', error);
    return null;
  }
}

/**
 * Guarda un modelo en el caché
 */
export async function setCachedModel(
  modelId: string,
  blob: Blob,
  version: string = '1.0.0'
): Promise<void> {
  try {
    const db = await getDB();

    // Verificar espacio disponible y limpiar si es necesario
    await ensureCacheSpace(blob.size);

    await db.put(STORE_NAME, {
      id: modelId,
      blob,
      size: blob.size,
      timestamp: Date.now(),
      version,
    });

    console.log(`✅ Modelo ${modelId} guardado en caché (${formatBytes(blob.size)})`);
  } catch (error) {
    console.error('Error guardando en caché:', error);
  }
}

/**
 * Elimina un modelo del caché
 */
export async function removeCachedModel(modelId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, modelId);
    console.log(`🗑️ Modelo ${modelId} eliminado del caché`);
  } catch (error) {
    console.error('Error eliminando del caché:', error);
  }
}

/**
 * Limpia todo el caché
 */
export async function clearCache(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log('🗑️ Caché limpiado completamente');
  } catch (error) {
    console.error('Error limpiando caché:', error);
  }
}

/**
 * Obtiene estadísticas del caché
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  modelCount: number;
  models: { id: string; size: number; timestamp: number }[];
}> {
  try {
    const db = await getDB();
    const allModels = await db.getAll(STORE_NAME);

    const totalSize = allModels.reduce((sum, m) => sum + m.size, 0);
    const models = allModels.map(m => ({
      id: m.id,
      size: m.size,
      timestamp: m.timestamp,
    }));

    return {
      totalSize,
      modelCount: allModels.length,
      models,
    };
  } catch (error) {
    console.error('Error obteniendo stats del caché:', error);
    return { totalSize: 0, modelCount: 0, models: [] };
  }
}

/**
 * Asegura que hay espacio suficiente en el caché
 * Elimina modelos más viejos si es necesario (LRU)
 */
async function ensureCacheSpace(requiredSize: number): Promise<void> {
  const db = await getDB();
  const stats = await getCacheStats();

  let currentSize = stats.totalSize;

  // Si el nuevo modelo excede el límite incluso solo, no podemos guardarlo
  if (requiredSize > MAX_CACHE_SIZE) {
    console.warn(`⚠️ Modelo muy grande para caché (${formatBytes(requiredSize)})`);
    return;
  }

  // Eliminar modelos viejos hasta tener espacio
  if (currentSize + requiredSize > MAX_CACHE_SIZE) {
    const sortedModels = stats.models.sort((a, b) => a.timestamp - b.timestamp);

    for (const model of sortedModels) {
      if (currentSize + requiredSize <= MAX_CACHE_SIZE) break;

      await db.delete(STORE_NAME, model.id);
      currentSize -= model.size;
      console.log(`🗑️ Eliminado modelo viejo ${model.id} para hacer espacio`);
    }
  }
}

/**
 * Verifica si un modelo está en caché
 */
export async function isModelCached(modelId: string): Promise<boolean> {
  try {
    const db = await getDB();
    const model = await db.get(STORE_NAME, modelId);
    return model !== undefined;
  } catch {
    return false;
  }
}

/**
 * Verifica si la versión en caché coincide
 */
export async function isCacheVersionValid(
  modelId: string,
  expectedVersion: string
): Promise<boolean> {
  try {
    const db = await getDB();
    const model = await db.get(STORE_NAME, modelId);
    return model?.version === expectedVersion;
  } catch {
    return false;
  }
}

/**
 * Formatea bytes a string legible
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Exportar objeto de utilidades
export const modelCache = {
  get: getCachedModel,
  set: setCachedModel,
  remove: removeCachedModel,
  clear: clearCache,
  stats: getCacheStats,
  isCached: isModelCached,
  isVersionValid: isCacheVersionValid,
};

export default modelCache;
