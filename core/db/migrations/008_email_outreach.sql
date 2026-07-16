-- Admin email outreach: compose sends + open-pixel tracking
CREATE TABLE IF NOT EXISTS email_outreach_sends (
    send_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email        VARCHAR(255) NOT NULL,
    subject         TEXT NOT NULL,
    recipient_name  VARCHAR(120),
    body_text       TEXT NOT NULL,
    html_body       TEXT NOT NULL,
    image_url       TEXT,
    image_caption   TEXT,
    cta_label       VARCHAR(80),
    cta_url         TEXT,
    github_url      TEXT,
    sign_off        TEXT,
    status          VARCHAR(32) NOT NULL DEFAULT 'queued',
    error           TEXT,
    open_count      INTEGER NOT NULL DEFAULT 0,
    opened_at       TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_outreach_sends_created
    ON email_outreach_sends (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_outreach_sends_sent_day
    ON email_outreach_sends (sent_at DESC)
    WHERE status = 'sent';

CREATE TABLE IF NOT EXISTS email_outreach_opens (
    open_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    send_id     UUID NOT NULL REFERENCES email_outreach_sends(send_id) ON DELETE CASCADE,
    opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address  VARCHAR(64),
    user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS idx_email_outreach_opens_send
    ON email_outreach_opens (send_id, opened_at DESC);
