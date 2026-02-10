-- VisionHub Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    image TEXT,
    is_admin INTEGER DEFAULT 0,
    premium_tier TEXT DEFAULT 'free',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    creator TEXT NOT NULL,
    category TEXT NOT NULL,
    technical TEXT NOT NULL,
    mAP REAL DEFAULT 0,
    precision REAL,
    inference_ms INTEGER,
    image TEXT,
    tags TEXT DEFAULT '[]',
    version TEXT DEFAULT '1.0.0',

    -- Local inference fields
    model_format TEXT,
    onnx_model_url TEXT,
    tfjs_model_url TEXT,
    model_size_bytes INTEGER,
    input_shape TEXT,
    labels TEXT,
    preprocessing TEXT,
    postprocessing TEXT,

    -- Premium fields
    is_premium INTEGER DEFAULT 0,
    api_access_tier TEXT DEFAULT 'free',
    is_public INTEGER DEFAULT 1,

    -- Legacy
    roboflow_id TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'free',
    user_id TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    request_limit INTEGER DEFAULT 1000,
    is_active INTEGER DEFAULT 1,
    last_used_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    nodes TEXT DEFAULT '[]',
    edges TEXT DEFAULT '[]',
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    workflow_id TEXT,
    model_id TEXT,
    status TEXT DEFAULT 'pending',
    config TEXT DEFAULT '{}',
    logs TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
CREATE INDEX IF NOT EXISTS idx_models_technical ON models(technical);
CREATE INDEX IF NOT EXISTS idx_models_is_public ON models(is_public);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user ON deployments(user_id);
