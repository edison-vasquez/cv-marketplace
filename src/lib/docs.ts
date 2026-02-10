export interface DocSection {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: 'getting-started' | 'guides' | 'api' | 'faq';
  content: string;
}

export const DOC_SECTIONS: DocSection[] = [
  // Primeros Pasos
  {
    slug: 'installation',
    title: 'Guía de Instalación',
    description: 'Pon VisionHub en funcionamiento en tu sistema en minutos.',
    icon: 'Download',
    category: 'getting-started',
    content: `
# Guía de Instalación

¡Bienvenido a VisionHub! Esta guía te ayudará a comenzar a desplegar modelos de visión por computadora en tu sistema.

## Requisitos del Sistema

Antes de instalar, asegúrate de que tu sistema cumpla con estos requisitos:

- **Sistema Operativo**: Windows 10/11, macOS 12+ o Ubuntu 20.04+
- **RAM**: Mínimo 8GB, recomendado 16GB
- **GPU**: GPU NVIDIA con soporte CUDA (opcional pero recomendado)
- **Almacenamiento**: Al menos 5GB de espacio libre

## Inicio Rápido

### Paso 1: Descargar el Desktop Runner

Descarga la versión apropiada para tu sistema operativo desde la página del modelo.

### Paso 2: Instalar Dependencias

Para aceleración por GPU, instala el NVIDIA CUDA Toolkit:

\`\`\`bash
# Windows: Descargar desde nvidia.com/cuda-downloads
# Linux:
sudo apt install nvidia-cuda-toolkit
\`\`\`

### Paso 3: Ejecutar la Aplicación

Simplemente haz doble clic en el ejecutable descargado para iniciar VisionHub.

## Instalación con Docker

Para usuarios avanzados, puedes usar Docker:

\`\`\`yaml
version: '3.9'
services:
  visionhub:
    image: roboflow/roboflow-inference-server-gpu:latest
    ports:
      - "9001:9001"
    environment:
      - ROBOFLOW_API_KEY=tu_api_key
\`\`\`

## Solución de Problemas

Si encuentras problemas:

1. Asegúrate de que los drivers de tu GPU estén actualizados
2. Verifica que el puerto 9001 no esté bloqueado por tu firewall
3. Confirma que tu API key sea correcta
    `
  },
  {
    slug: 'hardware-requirements',
    title: 'Requisitos de Hardware',
    description: 'Especificaciones de hardware recomendadas para un rendimiento óptimo.',
    icon: 'Cpu',
    category: 'getting-started',
    content: `
# Requisitos de Hardware

VisionHub está diseñado para funcionar en una variedad de configuraciones de hardware. Esto es lo que necesitas saber.

## Requisitos Mínimos

| Componente | Mínimo | Recomendado |
|-----------|---------|-------------|
| CPU | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| RAM | 8 GB | 16 GB |
| GPU | Integrada | NVIDIA GTX 1060+ |
| Almacenamiento | HDD | SSD |

## Soporte de GPU

### GPUs NVIDIA (Recomendado)
- GTX 1060 o más nueva
- Serie RTX para mejor rendimiento
- CUDA 11.0+ requerido

### GPUs AMD
- Soporte limitado vía ROCm
- Serie RX 5000 o más nueva

### Apple Silicon
- Chips M1/M2/M3 soportados
- Aceleración Metal habilitada

## Benchmarks de Rendimiento

| GPU | FPS (640x480) | FPS (1080p) |
|-----|---------------|-------------|
| RTX 4090 | 120+ | 90 |
| RTX 3080 | 90 | 60 |
| RTX 2070 | 60 | 30 |
| GTX 1060 | 30 | 15 |

## Optimizando el Rendimiento

1. **Usa aceleración GPU** cuando esté disponible
2. **Reduce la resolución de entrada** para procesamiento más rápido
3. **Procesa por lotes** múltiples frames
4. **Usa cuantización INT8** para dispositivos edge
    `
  },
  {
    slug: 'first-detection',
    title: 'Tu Primera Detección',
    description: 'Ejecuta tu primera detección de objetos en menos de un minuto.',
    icon: 'Play',
    category: 'getting-started',
    content: `
# Tu Primera Detección

¡Vamos a ejecutar tu primera detección de objetos! Este tutorial te guiará a través del proceso.

## Prerrequisitos

- VisionHub Desktop Runner instalado
- Una webcam o archivo de imagen
- Conexión a internet (para la primera descarga del modelo)

## Guía Paso a Paso

### 1. Iniciar la Aplicación

Abre VisionHub Desktop Runner. En el primer inicio, descargará los archivos del modelo requeridos.

### 2. Seleccionar Fuente de Entrada

Elige tu fuente de entrada:
- **Webcam**: Selecciona del menú desplegable
- **Archivo de Imagen**: Haz clic en "Subir Imagen"
- **Archivo de Video**: Haz clic en "Subir Video"
- **Cámara IP**: Ingresa la URL RTSP

### 3. Configurar Ajustes de Detección

Ajusta estos parámetros para resultados óptimos:

\`\`\`
Umbral de Confianza: 40%
Máximo de Detecciones: 25
Mostrar Etiquetas: Activado
Mostrar Confianza: Activado
\`\`\`

### 4. Iniciar Detección

Haz clic en el botón "Iniciar" para comenzar la detección en tiempo real.

## Entendiendo los Resultados

Cada detección muestra:
- **Clase**: Qué se detectó (ej. "Persona", "Vehículo")
- **Confianza**: Qué tan seguro está el modelo (0-100%)
- **Bounding Box**: Ubicación en la imagen

## Próximos Pasos

- Prueba diferentes modelos del marketplace
- Configura alertas para detecciones específicas
- Configura la integración de cámaras IP
    `
  },
  // Guías
  {
    slug: 'gpu-acceleration',
    title: 'Aceleración GPU',
    description: 'Maximiza el rendimiento con computación GPU.',
    icon: 'Zap',
    category: 'guides',
    content: `
# Aceleración GPU

Aprende cómo aprovechar la computación GPU para inferencia más rápida.

## ¿Por Qué Usar GPU?

La aceleración GPU puede mejorar el rendimiento 10-50 veces comparado con el procesamiento solo en CPU.

## Configuración de NVIDIA CUDA

### Windows

1. Descarga CUDA Toolkit desde [nvidia.com](https://developer.nvidia.com/cuda-downloads)
2. Instala con las opciones por defecto
3. Reinicia tu computadora
4. Verifica con: \`nvcc --version\`

### Linux

\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install nvidia-cuda-toolkit

# Verificar
nvidia-smi
\`\`\`

## Soporte WebGPU

VisionHub soporta WebGPU para aceleración basada en navegador:

\`\`\`javascript
// Verificar soporte de WebGPU
if ('gpu' in navigator) {
  const adapter = await navigator.gpu.requestAdapter();
  console.log('¡WebGPU soportado!', adapter.info);
}
\`\`\`

## Consejos de Rendimiento

1. **Cierra otras aplicaciones que usen GPU** durante la inferencia
2. **Actualiza los drivers de GPU** regularmente
3. **Usa procesamiento por lotes** para múltiples imágenes
4. **Monitorea la temperatura de la GPU** para prevenir throttling
    `
  },
  {
    slug: 'ip-cameras',
    title: 'Integración de Cámaras IP',
    description: 'Conecta a cámaras de red y sistemas CCTV.',
    icon: 'Video',
    category: 'guides',
    content: `
# Integración de Cámaras IP

Conecta VisionHub a tu infraestructura de cámaras existente.

## Protocolos Soportados

- **RTSP**: El más común, ampliamente soportado
- **RTMP**: Streaming en tiempo real
- **HTTP MJPEG**: Simple pero menor calidad
- **ONVIF**: Estándar de la industria para cámaras IP

## Conexión RTSP

### Formato Básico de URL

\`\`\`
rtsp://usuario:contraseña@ip_camara:554/stream
\`\`\`

### URLs Comunes por Marca

| Marca | Formato de URL |
|-------|------------|
| Hikvision | rtsp://admin:password@ip:554/Streaming/Channels/101 |
| Dahua | rtsp://admin:password@ip:554/cam/realmonitor?channel=1 |
| Axis | rtsp://ip/axis-media/media.amp |
| Genérico | rtsp://ip:554/stream1 |

## Configuración

\`\`\`python
# Ejemplo en Python
import cv2

camera_url = "rtsp://admin:password@192.168.1.100:554/stream"
cap = cv2.VideoCapture(camera_url)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    # Procesar frame...
\`\`\`

## Solución de Problemas

### Problemas de Conexión
- Verifica que la cámara esté en la misma red
- Revisa la configuración del firewall
- Prueba primero con VLC Media Player

### Problemas de Latencia
- Usa TCP en lugar de UDP
- Reduce la resolución del stream
- Verifica el ancho de banda de la red
    `
  },
  {
    slug: 'alerts-notifications',
    title: 'Alertas y Notificaciones',
    description: 'Configura alertas automatizadas cuando se detectan objetos.',
    icon: 'Bell',
    category: 'guides',
    content: `
# Alertas y Notificaciones

Configura alertas automatizadas cuando se detectan objetos específicos.

## Tipos de Alertas

### Notificaciones por Email

Envía alertas por email cuando ocurran detecciones:

\`\`\`json
{
  "type": "email",
  "recipient": "alertas@empresa.com",
  "subject": "Alerta de Detección: {class}",
  "conditions": {
    "classes": ["persona", "vehiculo"],
    "confidence_min": 0.8
  }
}
\`\`\`

### Notificaciones por Webhook

Envía datos a servicios externos:

\`\`\`json
{
  "type": "webhook",
  "url": "https://api.empresa.com/alertas",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token"
  }
}
\`\`\`

### Alertas por WhatsApp

Requiere WhatsApp Business API:

\`\`\`python
def enviar_alerta_whatsapp(telefono, mensaje, imagen_url):
    # Integración con WhatsApp Business API
    pass
\`\`\`

## Configurando Condiciones

Configura alertas condicionales:

1. **Filtro de Clase**: Solo alertar para clases específicas
2. **Umbral de Confianza**: Nivel mínimo de confianza
3. **Ventana de Tiempo**: Alertar solo durante horas específicas
4. **Período de Enfriamiento**: Prevenir inundación de alertas

## Mejores Prácticas

- Establece umbrales de confianza apropiados para reducir falsas alertas
- Usa períodos de enfriamiento para prevenir spam
- Incluye metadata relevante en las notificaciones
- Prueba las alertas en un ambiente de staging primero
    `
  },
  // Documentación de API
  {
    slug: 'api-overview',
    title: 'Resumen de la API',
    description: 'Introducción a la API de VisionHub.',
    icon: 'Code',
    category: 'api',
    content: `
# Resumen de la API

La API de VisionHub te permite integrar capacidades de visión por computadora en tus aplicaciones.

## URL Base

\`\`\`
https://api.visionhub.com/v1
\`\`\`

## Autenticación

Todas las solicitudes API requieren una API key:

\`\`\`bash
curl -H "Authorization: Bearer TU_API_KEY" \\
  https://api.visionhub.com/v1/models
\`\`\`

## Endpoints Disponibles

### Modelos
- \`GET /models\` - Listar todos los modelos
- \`GET /models/:id\` - Obtener detalles del modelo
- \`POST /models/:id/infer\` - Ejecutar inferencia

### Workflows
- \`GET /workflows\` - Listar workflows
- \`POST /workflows\` - Crear workflow
- \`PUT /workflows/:id\` - Actualizar workflow
- \`DELETE /workflows/:id\` - Eliminar workflow

### Despliegues
- \`GET /deployments\` - Listar despliegues
- \`POST /deployments\` - Crear despliegue
- \`PUT /deployments/:id\` - Actualizar despliegue
- \`DELETE /deployments/:id\` - Eliminar despliegue

## Límites de Tasa

| Plan | Solicitudes/min | Solicitudes/día |
|------|-------------|--------------|
| Gratis | 10 | 1,000 |
| Pro | 100 | 50,000 |
| Enterprise | Ilimitado | Ilimitado |

## Manejo de Errores

\`\`\`json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Demasiadas solicitudes. Por favor intenta más tarde."
  }
}
\`\`\`
    `
  },
  {
    slug: 'inference-api',
    title: 'API de Inferencia',
    description: 'Ejecuta detección de objetos vía API.',
    icon: 'Eye',
    category: 'api',
    content: `
# API de Inferencia

Ejecuta detección de objetos en imágenes usando la API.

## Endpoint

\`\`\`
POST /api/inference
\`\`\`

## Solicitud

\`\`\`bash
curl -X POST https://api.visionhub.com/v1/inference \\
  -H "Authorization: Bearer TU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "imagen_codificada_en_base64",
    "modelId": "hardhat-detection-v3",
    "confidence": 0.4
  }'
\`\`\`

## Respuesta

\`\`\`json
{
  "predictions": [
    {
      "class": "casco",
      "confidence": 0.95,
      "x": 245,
      "y": 180,
      "width": 120,
      "height": 100
    }
  ],
  "time": 45,
  "image": {
    "width": 640,
    "height": 480
  }
}
\`\`\`

## Ejemplos de SDK

### Python

\`\`\`python
from roboflow import Roboflow

rf = Roboflow(api_key="TU_API_KEY")
project = rf.workspace().project("hardhat-detection")
model = project.version(3).model

prediction = model.predict("imagen.jpg", confidence=40)
print(prediction.json())
\`\`\`

### JavaScript

\`\`\`javascript
const response = await fetch('/api/inference', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: imagenBase64,
    modelId: 'hardhat-detection-v3'
  })
});

const data = await response.json();
console.log(data.predictions);
\`\`\`
    `
  },
  // FAQ
  {
    slug: 'faq',
    title: 'Preguntas Frecuentes',
    description: 'Preguntas comunes sobre VisionHub.',
    icon: 'HelpCircle',
    category: 'faq',
    content: `
# Preguntas Frecuentes

## General

### ¿Necesito conexión a internet?

Solo para la descarga inicial del modelo. Una vez descargado, todo el procesamiento ocurre localmente en tu dispositivo, asegurando privacidad y velocidad.

### ¿Mis datos están seguros?

Sí. VisionHub procesa todo el video localmente en tu máquina. Nunca enviamos tus feeds de cámara a la nube.

### ¿Qué cámaras son compatibles?

VisionHub soporta:
- Webcams USB
- Cámaras IP (RTSP, ONVIF)
- Sistemas CCTV
- Archivos de video (MP4, AVI, etc.)

## Técnico

### ¿Por qué no se detecta mi GPU?

1. Asegúrate de tener los drivers de GPU más recientes
2. Instala CUDA Toolkit para GPUs NVIDIA
3. Verifica que WebGPU esté habilitado en tu navegador

### ¿Cómo puedo mejorar la precisión de detección?

1. Usa una cámara de mayor resolución
2. Asegura buenas condiciones de iluminación
3. Ajusta el umbral de confianza
4. Usa un modelo entrenado para tu caso de uso específico

### ¿Cuál es el frame rate máximo?

El frame rate depende de tu hardware:
- GPU de alta gama: 60-120 FPS
- GPU de gama media: 30-60 FPS
- Solo CPU: 5-15 FPS

## Facturación

### ¿Hay un plan gratuito?

¡Sí! Puedes usar VisionHub gratis con:
- 1,000 llamadas API por día
- 3 workflows guardados
- Soporte comunitario

### ¿Cómo actualizo mi plan?

Visita la configuración de tu cuenta para actualizar. Los planes Enterprise están disponibles para usuarios de alto volumen.

## Soporte

### ¿Cómo obtengo ayuda?

- Revisa esta documentación
- Visita nuestro foro comunitario
- Contacta a soporte@visionhub.com
- Enterprise: Canal de soporte dedicado
    `
  }
];

export function getDocBySlug(slug: string): DocSection | undefined {
  return DOC_SECTIONS.find(doc => doc.slug === slug);
}

export function getDocsByCategory(category: DocSection['category']): DocSection[] {
  return DOC_SECTIONS.filter(doc => doc.category === category);
}

export function getAllDocs(): DocSection[] {
  return DOC_SECTIONS;
}
