# Guía de Despliegue - VisionHub

Arquitectura híbrida: **Frontend en Vercel** + **Backend API en Cloudflare Workers**

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIOS                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────────────┐
│   VERCEL (Frontend) │       │  CLOUDFLARE (Backend API)   │
│                     │       │                             │
│  • Next.js App      │  ──►  │  • Workers (API endpoints)  │
│  • React Components │       │  • D1 (SQLite database)     │
│  • SSR/SSG Pages    │       │  • R2 (Model storage)       │
│  • Static Assets    │       │  • KV (Session cache)       │
└─────────────────────┘       └─────────────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
   visionhub.com              api.visionhub.com
```

---

## Paso 1: Desplegar Backend (Cloudflare)

### 1.1 Instalar Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 1.2 Crear recursos en Cloudflare

```bash
cd cloudflare-api

# Crear base de datos D1
wrangler d1 create visionhub-db
# Anota el database_id

# Crear KV namespace
wrangler kv:namespace create SESSIONS
# Anota el id

# Crear bucket R2
wrangler r2 bucket create visionhub-models
```

### 1.3 Actualizar wrangler.toml

Edita `cloudflare-api/wrangler.toml` con los IDs obtenidos:

```toml
[[d1_databases]]
binding = "DB"
database_name = "visionhub-db"
database_id = "TU_D1_DATABASE_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "TU_KV_NAMESPACE_ID"
```

### 1.4 Ejecutar migraciones

```bash
# Crear tablas
wrangler d1 execute visionhub-db --file=./migrations/0001_schema.sql

# Insertar datos de prueba
wrangler d1 execute visionhub-db --file=./migrations/0002_seed.sql
```

### 1.5 Configurar secrets

```bash
# JWT secret para autenticación
wrangler secret put JWT_SECRET
# Ingresa: un-string-secreto-muy-largo-y-seguro-123
```

### 1.6 Desplegar Workers

```bash
npm install
npm run deploy
```

Tu API estará disponible en: `https://visionhub-api.TU_CUENTA.workers.dev`

---

## Paso 2: Desplegar Frontend (Vercel)

### 2.1 Instalar Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2.2 Configurar variables de entorno

Crea un archivo `.env.production` en la raíz del proyecto:

```env
# URL del backend en Cloudflare
NEXT_PUBLIC_API_URL=https://visionhub-api.TU_CUENTA.workers.dev

# NextAuth (opcional si usas OAuth)
NEXTAUTH_URL=https://visionhub.vercel.app
NEXTAUTH_SECRET=otro-string-secreto-diferente

# OAuth providers (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GITHUB_ID=tu_github_client_id
GITHUB_SECRET=tu_github_client_secret
```

### 2.3 Desplegar a Vercel

```bash
# Desde la raíz del proyecto
vercel

# Para producción
vercel --prod
```

### 2.4 Configurar variables en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agrega todas las variables de `.env.production`

---

## Paso 3: Configurar Dominio Personalizado (Opcional)

### Vercel (Frontend)

1. Vercel Dashboard → Settings → Domains
2. Agrega `visionhub.com`
3. Configura DNS en tu registrador

### Cloudflare (API)

1. Cloudflare Dashboard → Workers Routes
2. Agrega route: `api.visionhub.com/*` → `visionhub-api`
3. O usa custom domain en Workers settings

---

## Paso 4: Verificar Despliegue

### Probar API

```bash
# Health check
curl https://visionhub-api.TU_CUENTA.workers.dev/

# Listar modelos
curl https://visionhub-api.TU_CUENTA.workers.dev/api/models

# Probar autenticación
curl -X POST https://visionhub-api.TU_CUENTA.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@visionhub.com", "password": "demo123"}'
```

### Probar Frontend

1. Abre https://TU_PROYECTO.vercel.app
2. Verifica que carguen los modelos
3. Prueba el login
4. Prueba la inferencia local

---

## Comandos Útiles

### Cloudflare

```bash
# Ver logs en tiempo real
wrangler tail

# Ejecutar SQL en D1
wrangler d1 execute visionhub-db --command="SELECT * FROM users"

# Subir modelo a R2
wrangler r2 object put visionhub-models/models/yolov8n.onnx --file=./model.onnx
```

### Vercel

```bash
# Ver logs
vercel logs

# Listar deployments
vercel ls

# Rollback
vercel rollback
```

---

## Troubleshooting

### Error: "API key required"
- Verifica que estás enviando el header `X-API-Key`
- Genera una nueva API key desde el dashboard

### Error: "CORS blocked"
- Verifica que el origen está en la lista de `cors()` en `src/index.ts`
- Agrega tu dominio de Vercel a la lista

### Error: "D1 database error"
- Ejecuta las migraciones: `wrangler d1 execute visionhub-db --file=./migrations/0001_schema.sql`
- Verifica el database_id en wrangler.toml

### Modelos no cargan
- Verifica que `NEXT_PUBLIC_API_URL` está configurado
- Revisa la consola del navegador para errores de red

---

## Costos Estimados

| Servicio | Plan Gratuito | Notas |
|----------|---------------|-------|
| Vercel | 100GB bandwidth/mes | Suficiente para empezar |
| CF Workers | 100k requests/día | Generoso para desarrollo |
| CF D1 | 5M rows read/día | Más que suficiente |
| CF R2 | 10GB storage | Para modelos ONNX |
| CF KV | 100k reads/día | Para caché |

**Total inicial: $0/mes** para desarrollo y pruebas.
