# Email Automation — Manual QA Checklist

## Production deploy (lifecycle OFF — safe default)

On EC2, ensure `infra/.env` contains:

```bash
EMAIL_LIFECYCLE_ENABLED=false
NEXT_PUBLIC_NEWSLETTER_ENABLED=false
```

Deploy:

```bash
bash infra/deploy-production.sh
```

Verify after deploy:

- [ ] `curl -sf http://127.0.0.1:8000/health`
- [ ] OTP login works for existing account
- [ ] No newsletter popup on landing (flag off)
- [ ] `docker compose -f infra/docker-compose.yml ps email_worker` — running (idle OK)

## Enable lifecycle (allowlist first)

```bash
EMAIL_LIFECYCLE_ENABLED=true
EMAIL_LIFECYCLE_ALLOWLIST=founder@zizka.ai
NEXT_PUBLIC_NEWSLETTER_ENABLED=true

docker compose -f infra/docker-compose.yml restart api email_worker
bash infra/deploy-dashboard.sh
```

## Local / staging QA

```bash
EMAIL_LIFECYCLE_ENABLED=true
EMAIL_STAGING_COMPRESS_DELAYS=true  # optional: 72h/7d → ~5min
NEXT_PUBLIC_NEWSLETTER_ENABLED=true
docker compose -f infra/docker-compose.yml up email_worker api
# Optional visual inbox: docker compose -f infra/docker-compose.yml --profile dev-mail up -d
# → http://localhost:8025 (set EMAIL_HOST=mailhog, EMAIL_PORT=1025 for capture)
```

## Phase 0 — Foundation

- [ ] OTP login/signup works (with and without `EMAIL_*`)
- [ ] Outbox row processes via worker

## Campaigns

- [ ] **C1 Welcome** — after signup (~5 min with compress)
- [ ] **C2 Getting started** — after signup (~10 min)
- [ ] **C3 No API 72h** — user with no keys
- [ ] **C4 API no events** — key created, no real events
- [ ] **C5 Inactive 7d** — had events, quiet 7 days
- [ ] **C6 Active check-in** — active user, not more than every 15d
- [ ] **C7 Account deleted** — promo code in email, re-signup extends trial
- [ ] **C8 Newsletter** — popup at 15s, subscribe, dedupe, unsubscribe

## Safety

- [ ] `EMAIL_LIFECYCLE_ENABLED=false` — no lifecycle sends; OTP works; popup hidden
- [ ] Signup completes when SMTP down (OTP saved; request returns 200)
- [ ] Worker restart — no duplicate sends
- [ ] `GET /v1/admin/email/stats` (admin JWT) shows pending/failed counts

## Instant rollback

```bash
EMAIL_LIFECYCLE_ENABLED=false
NEXT_PUBLIC_NEWSLETTER_ENABLED=false
docker compose -f infra/docker-compose.yml restart api email_worker
bash infra/deploy-dashboard.sh
```

## Production rollout

1. Deploy with `EMAIL_LIFECYCLE_ENABLED=false`
2. Enable with `EMAIL_LIFECYCLE_ALLOWLIST` for founder emails — 24h
3. Enable globally — monitor 48h
