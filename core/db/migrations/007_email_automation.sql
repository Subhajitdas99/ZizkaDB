-- Email automation: outbox, send log, churn offers, newsletter subscribers

CREATE TABLE IF NOT EXISTS email_outbox (
    outbox_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     VARCHAR(64) NOT NULL,
    recipient_key   VARCHAR(255) NOT NULL,
    dedupe_key      VARCHAR(255) NOT NULL DEFAULT 'default',
    to_email        VARCHAR(255) NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(32) NOT NULL DEFAULT 'pending',
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_error      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    UNIQUE (campaign_id, recipient_key, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_pending
    ON email_outbox (scheduled_at ASC)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_outbox_user_pending
    ON email_outbox (recipient_key)
    WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS email_send_log (
    log_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id         VARCHAR(64) NOT NULL,
    to_email            VARCHAR(255) NOT NULL,
    user_id             UUID,
    tenant_id           UUID,
    provider_message_id VARCHAR(255),
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_campaign
    ON email_send_log (campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_send_log_user
    ON email_send_log (user_id, campaign_id, sent_at DESC)
    WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS churn_offers (
    offer_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL,
    promo_code      VARCHAR(64) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    redeemed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_churn_offers_email
    ON churn_offers (email, created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    subscriber_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at     TIMESTAMPTZ,
    source              VARCHAR(32) NOT NULL DEFAULT 'popup',
    unsubscribe_token_hash VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active
    ON newsletter_subscribers (email)
    WHERE unsubscribed_at IS NULL;
