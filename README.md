# VisionHub - Marketplace de Modelos de Computer Vision

VisionHub es una plataforma completa para descubrir, probar y desplegar modelos de Computer Vision. Integrado con Roboflow y Pipeless AI para inferencia en tiempo real.

## Características

- **Marketplace de Modelos**: Explora +39 modelos pre-entrenados de detección de objetos
- **Demo Interactiva**: Prueba modelos con tus propias imágenes o webcam
- **Constructor de Workflows**: Crea pipelines de CV arrastrando bloques
- **Centro de Despliegue**: Gestiona tus modelos activos y métricas
- **Autenticación**: Login con GitHub OAuth o credenciales
- **Documentación Completa**: Guías de integración y API

## Stack Tecnológico

- **Framework**: Next.js 16 con App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js v4
- **Íconos**: Lucide React
- **APIs**: Roboflow Inference API, Pipeless AI

## Requisitos Previos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- (Opcional) Cuenta de GitHub para OAuth
- (Opcional) API Key de Roboflow

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd cv-marketplace
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="file:./dev.db"

# NextAuth - OBLIGATORIO
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-secreta-segura-aqui"

# GitHub OAuth (opcional pero recomendado)
GITHUB_ID="tu-github-client-id"
GITHUB_SECRET="tu-github-client-secret"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Roboflow API (para inferencia real)
ROBOFLOW_API_KEY="tu-roboflow-api-key"
```

#### Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

#### Configurar GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copia el Client ID y Client Secret

#### Obtener API Key de Roboflow

1. Crea una cuenta en [Roboflow](https://roboflow.com)
2. Ve a Settings > API Keys
3. Copia tu API Key

### 4. Configurar la base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npm run db:push

# Poblar con datos de ejemplo (39 modelos)
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run db:migrate` | Ejecuta migraciones de Prisma |
| `npm run db:push` | Sincroniza schema con la base de datos |
| `npm run db:seed` | Pobla la base de datos con modelos |
| `npm run db:studio` | Abre Prisma Studio (GUI de DB) |

## Estructura del Proyecto

```
cv-marketplace/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Script de población
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── models/    # CRUD de modelos
│   │   │   ├── workflows/ # CRUD de workflows
│   │   │   ├── deployments/ # CRUD de despliegues
│   │   │   └── inference/ # Endpoint de inferencia
│   │   ├── auth/          # Páginas de autenticación
│   │   ├── deployment/    # Centro de despliegues
│   │   ├── docs/          # Documentación
│   │   ├── models/        # Páginas de modelos
│   │   └── workflow/      # Constructor de workflows
│   ├── components/
│   │   ├── layout/        # Navbar, Footer
│   │   ├── model/         # Componentes de modelo
│   │   └── workflow/      # Componentes de workflow
│   ├── lib/
│   │   ├── auth.ts        # Configuración de NextAuth
│   │   ├── db.ts          # Cliente de Prisma
│   │   ├── docs.ts        # Contenido de documentación
│   │   └── utils.ts       # Utilidades (cn, etc.)
│   └── types/
│       └── workflow.ts    # Tipos de workflow
├── .env                   # Variables de entorno (ejemplo)
├── .env.local             # Variables de entorno (local)
└── package.json
```

## Modelos de Base de Datos

### User
- Autenticación con NextAuth
- Almacena API Key de Roboflow opcional
- Relaciones con Workflows y Deployments

### Model
- Modelos de CV disponibles en el marketplace
- Campos: title, slug, category, technical, mAP, precision, inferenceMs
- Tags para búsqueda

### Workflow
- Pipelines de CV creados por usuarios
- Nodos almacenados como JSON
- Soporte para compartir públicamente

### Deployment
- Despliegues activos de modelos
- Métricas de rendimiento (detecciones, FPS, uptime)
- Estados: pending, running, stopped, error

## API Endpoints

### Modelos
- `GET /api/models` - Lista modelos con paginación y filtros
- `GET /api/models/[id]` - Obtiene modelo por ID o slug

### Workflows
- `GET /api/workflows` - Lista workflows del usuario
- `POST /api/workflows` - Crea nuevo workflow
- `GET /api/workflows/[id]` - Obtiene workflow
- `PUT /api/workflows/[id]` - Actualiza workflow
- `DELETE /api/workflows/[id]` - Elimina workflow

### Deployments
- `GET /api/deployments` - Lista despliegues del usuario
- `POST /api/deployments` - Crea nuevo despliegue
- `GET /api/deployments/[id]` - Obtiene despliegue
- `PUT /api/deployments/[id]` - Actualiza despliegue
- `DELETE /api/deployments/[id]` - Elimina despliegue

### Inferencia
- `POST /api/inference` - Ejecuta inferencia en imagen

## Funcionalidades del Workflow Builder

### Bloques Disponibles

| Tipo | Nombre | Descripción |
|------|--------|-------------|
| Model | Detección de Objetos | Detectar objetos en frames |
| Model | Clasificación | Categorizar toda la imagen |
| Logic | Recorte | Recortar resultados de detección |
| Logic | Filtro de Confianza | Eliminar resultados de baja confianza |
| Output | Visualizar Bounding Box | Dibujar recuadros en la imagen |
| Output | Webhook | Enviar datos a una URL externa |

### Opciones de Configuración

- **Umbral de Confianza**: 0-100%
- **Versión del Modelo**: YOLOv11, YOLOv8, COCO
- **Máximo de Detecciones**: 1-100
- **Clases Objetivo**: Persona, Vehículo, Casco, etc.
- **Color del Recuadro**: Selector de color
- **Webhook URL**: Para integraciones externas

## Verificación de Hardware

El componente HardwareCheck detecta automáticamente:

- **WebGPU**: API moderna para aceleración GPU
- **WebGL 2.0**: Fallback para navegadores sin WebGPU
- **Estimación de Rendimiento**: Basada en GPU detectada

### Niveles de Rendimiento

| GPU | Nivel | Inferencia Estimada |
|-----|-------|---------------------|
| RTX 40xx, RTX 30xx, M3 Pro/Max | Alto Rendimiento | 8-15ms |
| RTX 20xx, GTX 16xx, M1/M2/M3, Intel Arc | Buen Rendimiento | 15-30ms |
| Intel UHD, Intel HD, Radeon Graphics | Rendimiento Moderado | 30-60ms |
| Otras | Rendimiento Estándar | 20-40ms |

## Despliegue en Producción

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura las variables de entorno
3. Cambia `DATABASE_URL` a una base de datos en la nube (PostgreSQL recomendado)
4. Despliega

### Docker

```bash
# Construir imagen
docker build -t visionhub .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local visionhub
```

## Resolución de Problemas

### Error de Base de Datos

```bash
# Resetear base de datos
rm -rf prisma/dev.db
npm run db:push
npm run db:seed
```

### Error de Autenticación

- Verifica que `NEXTAUTH_SECRET` esté configurado
- Confirma las URLs de callback en GitHub/Google
- Revisa que `NEXTAUTH_URL` coincida con tu dominio

### Error de Inferencia

- Verifica tu `ROBOFLOW_API_KEY`
- Confirma que el modelo existe en Roboflow
- Revisa los logs de la API en `/api/inference`

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Roboflow Documentation](https://docs.roboflow.com)
- [Pipeless AI Documentation](https://pipeless.ai/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
