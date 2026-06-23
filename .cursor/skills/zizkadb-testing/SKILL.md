---
name: zizkadb-testing
description: Runs and adds ZizkaDB tests including unit, integration, security, and E2E workflow tests. Use when adding tests, test scenarios, integration testing, regression testing, or verifying database behavior.
---

# ZizkaDB Testing

## Test types
| Type | Command | Stack? |
|------|---------|--------|
| Unit | `pytest core/tests/ -m "not integration" -v` | No |
| Integration | `pytest core/tests/ -m integration -v` | Yes (:8000) |
| Security | `pytest core/tests/ -m security -v` | Yes |
| Smoke | `bash scripts/smoke-test.sh` | Yes |
| E2E workflow | `bash scripts/test-e2e-workflow.sh` | Yes |
| Pre-push | `bash scripts/verify-release.sh` | Partial |

## When adding a feature
1. Find matching scenarios in [scenario-catalog.md](scenario-catalog.md)
2. Add test to appropriate `core/tests/test_integration_*.py`
3. Use fixtures from `core/tests/conftest.py`
4. Mark `@pytest.mark.integration`; add `@pytest.mark.requires_openai` if embeddings needed
5. Run unit then integration before PR

## P0 scenarios (must never regress)
| ID | Test file |
|----|-----------|
| B6/B7 Agent scope | `test_integration_auth.py` |
| B9 Tenant isolation | `test_integration_auth.py` |
| C1 Log event | `test_integration_events.py` |
| C2 Causal why | `test_integration_events.py` |
| E1 Search without key | `test_integration_search.py` |
| E11 GDPR forget | `test_integration_search.py` |

## Fixtures (conftest.py)
- `api_base` — `ZIZKADB_TEST_URL` or `http://localhost:8000`
- `dev_headers` — Bearer dev API key
- `jwt_headers` — from `/v1/auth/dev-token`
- `unique_agent` — random agent name per test

## OpenAI-dependent tests
Mark `@pytest.mark.requires_openai`. Skip in CI without secret:
```python
pytest.importorskip("os").getenv("OPENAI_API_KEY")  # or pytest skip in fixture
```

## Start stack for integration
```bash
bash scripts/setup-local.sh
# or ensure stack already running on :8000
```

## Additional resources
- [scenario-catalog.md](scenario-catalog.md) — full scenario matrix
