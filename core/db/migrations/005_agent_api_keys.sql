-- Bind API keys to agents (nullable for legacy tenant-wide keys).
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS agent_id VARCHAR(255);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_api_keys_agent'
    ) THEN
        ALTER TABLE api_keys
            ADD CONSTRAINT fk_api_keys_agent
            FOREIGN KEY (agent_id, tenant_id)
            REFERENCES agents (agent_id, tenant_id)
            ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_api_keys_agent ON api_keys (tenant_id, agent_id) WHERE revoked = FALSE;
