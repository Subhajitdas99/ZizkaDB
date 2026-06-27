-- Promo code redemptions for managed-cloud signups
ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);

CREATE TABLE IF NOT EXISTS promo_redemptions (
    redemption_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(50) NOT NULL,
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan          VARCHAR(50) NOT NULL,
    trial_days    INTEGER NOT NULL,
    redeemed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_redemptions (code);
CREATE INDEX IF NOT EXISTS idx_users_promo_code ON users (promo_code) WHERE promo_code IS NOT NULL;
