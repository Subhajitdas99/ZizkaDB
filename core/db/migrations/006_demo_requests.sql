-- Demo requests from landing page "Book demo" form
CREATE TABLE IF NOT EXISTS demo_requests (
    request_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name    VARCHAR(80) NOT NULL,
    last_name     VARCHAR(80) NOT NULL,
    company_name  VARCHAR(255) NOT NULL,
    website       VARCHAR(500) NOT NULL,
    ip_address    VARCHAR(64),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_requests_created
    ON demo_requests (created_at DESC);
