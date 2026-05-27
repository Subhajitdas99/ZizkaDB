-- Per-tenant embedding provider (managed cloud + optional self-host BYOK)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS embedding_provider VARCHAR(32) NOT NULL DEFAULT 'openai';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(64) NOT NULL DEFAULT 'text-embedding-3-small';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS embedding_use_platform_key BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS embedding_api_key_encrypted TEXT;
