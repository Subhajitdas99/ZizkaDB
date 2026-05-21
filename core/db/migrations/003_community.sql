-- Public community board (questions, experiences, screenshots)
CREATE TABLE IF NOT EXISTS community_posts (
    post_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name   VARCHAR(120) NOT NULL,
    author_email  VARCHAR(255),
    category      VARCHAR(32) NOT NULL DEFAULT 'question',
    title         VARCHAR(300) NOT NULL,
    body          TEXT NOT NULL,
    image_urls    JSONB NOT NULL DEFAULT '[]'::jsonb,
    reply_count   INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_created
    ON community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category
    ON community_posts (category, created_at DESC);

CREATE TABLE IF NOT EXISTS community_replies (
    reply_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id       UUID NOT NULL REFERENCES community_posts(post_id) ON DELETE CASCADE,
    author_name   VARCHAR(120) NOT NULL,
    author_email  VARCHAR(255),
    body          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_replies_post
    ON community_replies (post_id, created_at ASC);
