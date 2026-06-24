# ZizkaDB Test Scenario Catalog

Status: **P0** = implemented in pytest · **P1** = planned · **Manual** = no automation yet

## A. Infrastructure
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| A1 | GET /health | Integration | P0 | test_smoke.py |
| A2 | Stack boots | Integration | P0 | setup-local.sh |
| A3 | Postgres schema on log | Integration | P1 | — |
| A4 | Qdrant point on embed | Integration | P1 | requires_openai |
| A5 | Redis embedding cache | Integration | P2 | — |
| A6 | GET /v1/stats | Integration | P1 | — |

## B. Auth & authorization
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| B1 | Dev API key log | Integration | P0 | test_smoke.py |
| B2 | Invalid key → 401 | Integration | P0 | test_integration_auth.py |
| B3 | Revoked key → 401 | Integration | P1 | — |
| B4 | JWT dev-token | Integration | P0 | test_smoke.py |
| B5 | Invalid JWT → 401 | Integration | P1 | — |
| B6 | Agent-scoped key match | Integration | P0 | test_integration_auth.py |
| B7 | Agent-scoped key mismatch → 403 | Integration | P0 | test_integration_auth.py |
| B8 | Tenant-wide key any agent | Integration | P0 | test_integration_auth.py |
| B9 | Cross-tenant why → 404 | Integration | P0 | test_integration_auth.py |
| B10 | DEV_API_KEY blocked in prod | Integration | P2 | — |
| B11 | OTP rate limit → 429 | Integration | P2 | — |
| B12 | Settings PUT with API key → 403 | Integration | P1 | — |
| B13 | Legacy key not JWT | Unit | P0 | test_smoke.py |

## C. Event logging
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| C1 | Minimal log → 201 | Integration | P0 | test_integration_events.py |
| C2 | Causal chain why length 3 | Integration | P0 | test_integration_events.py |
| C3 | Session grouping | Integration | P1 | — |
| C4 | Agent auto-create | Integration | P0 | test_integration_events.py |
| C5 | Checksum present | Integration | P0 | test_integration_events.py |
| C6 | Large JSON payload | Integration | P2 | — |
| C7 | Invalid parent_id | Integration | P2 | — |
| C8 | Metadata stored | Integration | P1 | — |
| C9 | usage_daily meter | Integration | P2 | — |
| C10 | Log without embeddings | Integration | P1 | — |
| C11 | Log with embeddings | Integration | P1 | requires_openai |
| C12 | Concurrent logs | Load | P2 | — |

## D. Query & causality
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| D1 | Query by agent | Integration | P0 | test_integration_events.py |
| D2 | Filter event_type | Integration | P1 | — |
| D3 | Filter session_id | Integration | P1 | — |
| D4 | before/after time | Integration | P2 | — |
| D5 | Pagination offset | Integration | P2 | — |
| D6 | why depth limit | Integration | P1 | — |
| D7 | why missing event → 404 | Integration | P0 | test_integration_events.py |
| D8 | why cross-tenant → 404 | Integration | P0 | test_integration_auth.py |
| D9 | Time travel at() | Integration | P1 | test_integration_events.py |
| D10 | STATE_SET in at() | Integration | P2 | — |
| D11 | at() agent scope | Security | P2 | — |

## E. Search & memory
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| E1 | Search without embed key → 400 | Integration | P0 | test_integration_search.py |
| E2 | Search with key returns hits | Integration | P1 | requires_openai |
| E3 | Search tenant isolation | Integration | P1 | — |
| E4 | Search agent filter | Integration | P1 | requires_openai |
| E5 | Search tenant-wide | Integration | P1 | — |
| E6 | context_for non-empty | Integration | P1 | requires_openai |
| E7 | context_for token budget | Integration | P2 | — |
| E8 | context excludes session | Integration | P2 | — |
| E9 | memory_diff | Integration | P1 | — |
| E10 | memory_diff 404 | Integration | P1 | — |
| E11 | forget deletes events | Integration | P0 | test_integration_search.py |
| E12 | forget no match | Integration | P0 | test_integration_search.py |
| E13 | Model change behavior | Manual | P2 | — |

## F. Agents & baselines
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| F1 | List agents | Integration | P1 | — |
| F2 | Create agent + key | Integration | P1 | — |
| F3 | Duplicate agent → 409 | Integration | P1 | — |
| F4 | Delete agent | Integration | P1 | — |
| F5 | Agent stats | Integration | P2 | — |
| F6 | List sessions | Integration | P1 | — |
| F7 | Baseline insufficient_data | Integration | P1 | — |
| F8 | Baseline warming_up | Integration | P1 | — |
| F9 | Baseline drift ok | Integration | P2 | — |
| F10 | Invalid agent_id → 400 | Integration | P1 | — |
| F11 | Dashboard test-event | Integration | P1 | — |
| F12 | API key CRUD | Integration | P1 | — |

## G. Settings
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| G1 | Embeddings catalog | Integration | P1 | — |
| G2 | Get embedding config | Integration | P1 | — |
| G3 | BYOK save | Integration | P2 | — |
| G4 | encrypt/decrypt round-trip | Unit | P1 | — |

## H. SDK
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| H1-H4 | Dev key, env, legacy | Unit | P0 | test_smoke.py |
| H5 | Full SDK round-trip | Integration | P1 | test-e2e-workflow.sh |
| H6 | Error mapping | Unit | P1 | — |
| H7 | TS parity | Manual | P1 | — |
| H8 | Telemetry opt-out | Unit | P1 | — |

## I. Integrations
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| I1 | LangChain import | Unit | P0 | verify-release.sh |
| I2 | LangChain parent chain | Integration | P2 | — |
| I3 | CrewAI logger chain | Integration | P2 | — |
| I4 | MCP log_event | Integration | P2 | — |
| I7 | zizkadb init templates | Integration | P0 | verify-release.sh |

## J. Dashboard
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| J1-J7 | UI flows | Manual/E2E | P2 | No Playwright yet |

## K. Security
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| K1-K2 | SQL injection | Security | P2 | — |
| K3 | Forget then no search hit | Integration | P0 | E11 |
| K4 | Community honeypot | Integration | P2 | — |
| K5 | Community rate limit | Integration | P2 | — |

## L. Performance
| ID | Scenario | Type | Priority | Status |
|----|----------|------|----------|--------|
| L1-L5 | Load / resilience | Load | P2 | — |
