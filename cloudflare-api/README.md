# VisionHub API - Cloudflare Workers

API backend para VisionHub ejecutándose en Cloudflare Workers con D1 (SQLite edge).

## Requisitos

- Node.js 18+
- Cuenta de Cloudflare con Workers y D1 habilitados
- Wrangler CLI

## Setup

### 1. Instalar dependencias

```bash
cd cloudflare-api
npm install
```

### 2. Crear base de datos D1

```bash
# Crear la base de datos
wrangler d1 create visionhub-db

# Copiar el database_id que aparece y pegarlo en wrangler.toml
```

### 3. Ejecutar migraciones

```bash
# Crear tablas
wrangler d1 execute visionhub-db --file=./migrations/0001_schema.sql

# Insertar datos de prueba
wrangler d1 execute visionhub-db --file=./migrations/0002_seed.sql
```

### 4. Crear KV Namespace (para sesiones)

```bash
wrangler kv:namespace create SESSIONS
# Copiar el id al wrangler.toml
```

### 5. Crear R2 Bucket (para modelos ONNX)

```bash
wrangler r2 bucket create visionhub-models
```

### 6. Configurar secrets

```bash
wrangler secret put JWT_SECRET
# Ingresa un string seguro para firmar JWTs
```

### 7. Desarrollo local

```bash
npm run dev
# API disponible en http://localhost:8787
```

### 8. Deploy a producción

```bash
npm run deploy
```

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/models` | Listar modelos |
| GET | `/api/models/filters` | Obtener filtros |
| GET | `/api/models/:slug` | Detalle de modelo |

### Requieren JWT (Authorization: Bearer <token>)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/api-keys` | Listar API keys |
| POST | `/api/api-keys` | Crear API key |
| DELETE | `/api/api-keys/:id` | Revocar API key |

### Requieren API Key (X-API-Key header)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/inference` | Ejecutar inferencia |

## Estructura

```
cloudflare-api/
├── src/
│   ├── index.ts          # Entry point y rutas
│   ├── routes/
│   │   ├── models.ts     # CRUD de modelos
│   │   ├── inference.ts  # Inferencia con API key
│   │   ├── api-keys.ts   # Gestión de API keys
│   │   └── auth.ts       # Autenticación JWT
│   └── middleware/
│       └── auth.ts       # Validación de JWT y API key
├── migrations/
│   ├── 0001_schema.sql   # Esquema de tablas
│   └── 0002_seed.sql     # Datos iniciales
├── wrangler.toml         # Configuración de Wrangler
└── package.json
```

## Configuración del Frontend (Vercel)

En el frontend Next.js, configura la variable de entorno:

```env
NEXT_PUBLIC_API_URL=https://api.visionhub.com
```

Y actualiza las llamadas fetch para usar esta URL base.
