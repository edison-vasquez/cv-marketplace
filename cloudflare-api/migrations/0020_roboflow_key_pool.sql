-- Migration 0020: Internal Roboflow API Key Pool
-- Manages multiple Roboflow API keys for seamless demo inference

CREATE TABLE IF NOT EXISTS roboflow_keys (
    id TEXT PRIMARY KEY,
    api_key TEXT NOT NULL,
    label TEXT NOT NULL,
    roboflow_account TEXT,

    -- Rate limit tracking
    daily_usage INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 100,
    monthly_usage INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 1000,

    -- State management
    is_active INTEGER DEFAULT 1,
    is_healthy INTEGER DEFAULT 1,
    last_used_at TEXT,
    last_error TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    cooldown_until TEXT,

    -- Priority (higher = preferred)
    priority INTEGER DEFAULT 0,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rf_keys_selection
    ON roboflow_keys(is_active, is_healthy, daily_usage);
