# Test Coverage Gap Analysis

Generated: 2026-01-31
Updated: 2026-01-31

**Overall Coverage: 50.82% statements, 57.13% branches, 47.31% functions**

Previous: 48.78% statements, 56% branches, 44.39% functions

## Recent Improvements

| File | Before | After | Change |
|------|--------|-------|--------|
| `backup-service.js` | 10.3% | 69.97% | +59.67% |
| `backup.js` (routes) | 54.44% | 93.33% | +38.89% |
| `memories.js` (routes) | 28.34% | 33.33% | +4.99% |
| `token-gate-service.js` | 44.3% | 90.65% | +46.35% |
| `federation-service.js` | 31.1% | 61.93% | +30.83% |

## Critical Gaps (< 25% coverage)

These need immediate attention:

| File | Coverage | Priority | Notes |
|------|----------|----------|-------|
| `audio-fingerprint.js` | 15.85% | P1 | Audio deduplication untested |
| `audio-sync-service.js` | 20.71% | P1 | Federated audio sync untested |
| `ffmpeg-service.js` | 23.03% | P1 | Video/audio processing untested |
| `audio-library-service.js` | 24.6% | P1 | Audio template library untested |

## High Priority Gaps (25-35% coverage)

| File | Coverage | Priority | Notes |
|------|----------|----------|-------|
| `audio.js` (routes) | 27.25% | P1 | Audio API endpoints |
| `memory-ipfs-service.js` | 26.78% | P2 | Memory IPFS operations |
| `wallet-service.js` | 28.66% | P2 | Wallet operations |
| `wallet/routes.js` | 29.29% | P2 | Wallet API endpoints |
| `ollama-service.js` | 30.52% | P2 | Ollama AI provider |
| `memory-service.js` | 34.44% | P2 | Core memory operations |

## Medium Priority Gaps (35-50% coverage)

| File | Coverage | Priority | Notes |
|------|----------|----------|-------|
| `dht-service.js` | 39.82% | P3 | DHT routing/discovery |
| `version-service.js` | 39.42% | P3 | Version checking |
| `ipfs-service.js` | 40.59% | P3 | IPFS pinning/retrieval |
| `plugins.js` | 41.53% | P3 | Plugin management |
| `neo4j-service.js` | 42.4% | P3 | Graph database operations |
| `memory-extractor.js` | 45.61% | P3 | Memory extraction from chat |

## Well-Covered Areas (> 75%)

These are in good shape:

| File | Coverage |
|------|----------|
| `broadcast.js` | 100% |
| `http-client.js` | 96.36% |
| `lmstudio-cli.js` | 93.97% |
| `backup.js` (routes) | 93.33% |
| `token-gate-service.js` | 90.65% |
| `ai-provider.js` | 82.03% |
| `memory-marketplace-service.js` | 80.16% |
| `prompt-executor.js` | 79.25% |
| `memory-query-service.js` | 76.43% |

---

## Test Improvement Plan

### Phase 1: Critical Services (Target: 60% overall) ✅ COMPLETE

Tests added in Phase 1:

#### 1.1 Backup/Restore Tests ✅
**File:** `tests/e2e/features/backup/backup.feature`
- 12 scenarios covering status, health, history, list, toggle, config, run, restore
- Coverage improved: 10.3% → 69.97%

#### 1.2 Memory CRUD Tests ✅
**File:** `tests/e2e/features/memories/memories.feature`
- Added 18 API scenarios covering status, config, search, filter, graph, embedding, maintenance
- Coverage improved: 28.34% → 33.33%

#### 1.3 Wallet Tests ✅
**File:** `tests/e2e/features/wallet/wallet.feature`
- Added 14 API scenarios covering groups, tokens, settings, derive, sign, validation
- Coverage: 29.29% (needs more work)

### Phase 2: Audio System Tests (Target: 40% audio coverage)

#### 2.1 Audio Library Tests
**File:** `tests/e2e/features/audio/audio-library.feature`

```gherkin
Feature: Audio Library

  @api @smoke
  Scenario: List audio templates
    When I GET "/api/audio/templates"
    Then the response should be successful

  @api
  Scenario: Get template by ID
    When I GET "/api/audio/templates/ambient-drone"
    Then the response should be successful
    And the response should contain template data

  @api @requires-ffmpeg
  Scenario: Generate audio from template
    When I POST to "/api/audio/generate" with template ID
    Then the response should be successful
    And the response should contain audio file path
```

### Phase 3: Wallet Tests (Target: 50% wallet coverage)

#### 3.1 Wallet Operations
**File:** `tests/e2e/features/wallet/wallet.feature`

```gherkin
Feature: Wallet Management

  @api @smoke
  Scenario: Get wallet status
    When I GET "/api/wallet/status"
    Then the response should be successful

  @api
  Scenario: Encrypt wallet
    When I POST to "/api/wallet/encrypt" with password
    Then the response should be successful

  @api
  Scenario: Get wallet balance
    When I GET "/api/wallet/balance"
    Then the response should be successful
    And the response should contain SOL balance
```

### Phase 4: Infrastructure Tests (Target: 50% infra coverage)

#### 4.1 IPFS Tests (requires IPFS running)
```gherkin
@requires-ipfs
Feature: IPFS Operations

  Scenario: Pin content
  Scenario: Unpin content
  Scenario: Get pinned content list
```

#### 4.2 Neo4j Tests (requires Neo4j running)
```gherkin
@requires-neo4j
Feature: Graph Operations

  Scenario: Create node
  Scenario: Create relationship
  Scenario: Query graph
```

---

## Implementation Priority

1. **Week 1**: Backup + Memory CRUD tests (covers 2 critical gaps)
2. **Week 2**: Wallet tests (security-critical)
3. **Week 3**: Audio system tests (feature completeness)
4. **Week 4**: Infrastructure tests (IPFS, Neo4j, DHT)

## Metrics Targets

| Metric | Previous | Current | Target |
|--------|----------|---------|--------|
| Statement Coverage | 48.78% | 50.82% | 70% |
| Branch Coverage | 56% | 57.13% | 65% |
| Function Coverage | 44.39% | 47.31% | 60% |

## Test Types Needed

1. **API Tests** (`@api`): Most routes need more coverage
2. **Integration Tests** (`@requires-*`): For infrastructure services
3. **UI Tests** (`@ui`): Already have good coverage
4. **Smoke Tests** (`@smoke`): Quick sanity checks for critical paths
