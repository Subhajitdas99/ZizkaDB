-- Enterprise lead capture: role/title and form source (e.g. enterprise page)
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS position VARCHAR(120);
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS source VARCHAR(64);
