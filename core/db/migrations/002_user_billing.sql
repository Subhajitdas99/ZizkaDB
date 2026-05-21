-- Billing fields for managed-cloud users (Stripe + local trial)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer
    ON users (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_subscription
    ON users (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users (subscription_status);

-- Existing managed users: treat as trialing Pro (adjust after Stripe goes live)
UPDATE users
SET plan = 'pro',
    subscription_status = 'trialing',
    trial_ends_at = COALESCE(trial_ends_at, created_at + INTERVAL '30 days')
WHERE plan IS NULL OR subscription_status IS NULL;
