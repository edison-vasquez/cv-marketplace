// Utilidades de preprocesamiento de imágenes para inferencia

import { InputShape, PreprocessingConfig } from './types';

/**
 * Redimensiona una imagen al tamaño requerido por el modelo
 */
export function resizeImage(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  // Crear canvas temporal con imagen original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Dibujar redimensionado
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Convierte ImageData a tensor Float32Array en formato CHW (Channels, Height, Width)
 * Aplica normalización según configuración
 */
export function imageDataToTensor(
  imageData: ImageData,
  config: PreprocessingConfig
): Float32Array {
  const { width, height, data } = imageData;
  const { mean, std, normalize, channelOrder } = config;

  // Crear tensor en formato CHW [3, height, width]
  const tensor = new Float32Array(3 * width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;

      // Obtener valores RGB
      let r = data[srcIdx];
      let g = data[srcIdx + 1];
      let b = data[srcIdx + 2];

      // Convertir BGR si es necesario
      if (channelOrder === 'BGR') {
        [r, b] = [b, r];
      }

      // Normalizar a 0-1 si es necesario
      if (normalize) {
        r = r / 255.0;
        g = g / 255.0;
        b = b / 255.0;
      }

      // Aplicar mean/std normalization
      r = (r - mean[0]) / std[0];
      g = (g - mean[1]) / std[1];
      b = (b - mean[2]) / std[2];

      // Guardar en formato CHW
      const dstIdx = y * width + x;
      tensor[0 * width * height + dstIdx] = r; // Canal R
      tensor[1 * width * height + dstIdx] = g; // Canal G
      tensor[2 * width * height + dstIdx] = b; // Canal B
    }
  }

  return tensor;
}

/**
 * Preprocesa una imagen completa para inferencia
 */
export function preprocessImage(
  imageData: ImageData,
  inputShape: InputShape,
  preprocessing: PreprocessingConfig
): Float32Array {
  // 1. Redimensionar
  const resized = resizeImage(imageData, inputShape.width, inputShape.height);

  // 2. Convertir a tensor normalizado
  const tensor = imageDataToTensor(resized, preprocessing);

  return tensor;
}

/**
 * Convierte un elemento de imagen/video a ImageData
 */
export function elementToImageData(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  maxWidth?: number,
  maxHeight?: number
): ImageData {
  const canvas = document.createElement('canvas');

  let width = element instanceof HTMLVideoElement ? element.videoWidth : element.width;
  let height = element instanceof HTMLVideoElement ? element.videoHeight : element.height;

  // Redimensionar si excede límites
  if (maxWidth && width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * scale);
  }
  if (maxHeight && height > maxHeight) {
    const scale = maxHeight / height;
    height = maxHeight;
    width = Math.round(width * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(element, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Convierte una URL de imagen (base64, blob, o http) a ImageData
 */
export async function base64ToImageData(imageUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Permitir carga cross-origin para URLs http/https
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo crear contexto de canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log(`📸 Imagen procesada: ${canvas.width}x${canvas.height}`);
        resolve(imageData);
      } catch (err) {
        reject(new Error(`Error procesando imagen: ${err instanceof Error ? err.message : 'Error desconocido'}`));
      }
    };

    img.onerror = (e) => {
      console.error('Error cargando imagen:', e);
      reject(new Error('No se pudo cargar la imagen. Verifica que el archivo sea válido.'));
    };

    // Manejar diferentes formatos de URL
    if (imageUrl.startsWith('data:')) {
      // Ya es base64 con prefijo data:
      img.src = imageUrl;
    } else if (imageUrl.startsWith('blob:')) {
      // Blob URL - cargar directamente
      img.src = imageUrl;
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // URL externa
      img.src = imageUrl;
    } else {
      // Asumir que es base64 sin prefijo
      img.src = `data:image/jpeg;base64,${imageUrl}`;
    }
  });
}
