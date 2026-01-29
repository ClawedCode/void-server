# void-server Evolution Roadmap

## Overview

This plan outlines improvements for void-server based on the existing architecture, manifesto vision ("consciousness emergence protocols"), and integration opportunities with the ClawedCode ecosystem.

**Priorities (per user input):**
1. Memory Sharing Network (with $CLAWED token economics)
2. AI Enhancements (RAG, embeddings, multi-model)
3. Federation Protocol (server-to-server communication)

---
## Security Audit (Federation + Memory Sharing)

Latest audit: **2026-01-28**. Full findings in `docs/SECURITY-AUDIT-FEDERATION-2026-01-28.md`.

**Status: ✅ All findings remediated** (Phase 2.5 complete)

### Findings Summary
- Critical: federation routes lack authN/authZ (peer tampering + memory exfil/injection)
- Critical: token-gated endpoints bypassed due to feature-name mismatch
- High: SSRF via peer add + DHT endpoints
- High: DHT nodeId spoofing / routing table poisoning
- Medium: challenge-response replay/signing oracle risk
- Medium: memory sharing ignores trust and allows unsigned content by default
- Medium: potential import/embedding DoS without limits
- Low: wallet format not validated in token-gate middleware

### Phase 2.5: Federation Security Hardening ✅ COMPLETE
- [x] Add federation auth middleware (admin vs peer vs local) for `/api/federation/*`
- [x] Fix token gate feature mapping; fail closed on unknown features
- [x] Validate/allowlist peer endpoints; block private IPs by default (SSRF protection)
- [x] DHT: verify `nodeId == sha256(publicKey)` on announce/push/lookup
- [x] DHT: require signed announcements (with timestamp + signature verification)
- [x] Challenge-response: track issued challenges + TTL; reject replays
- [x] Trust gating: require verified/trusted peers for memory export/import/sync
- [x] Require signed memories by default on import (`FEDERATION_REQUIRE_SIGNATURES`)
- [x] Add payload size limits + rate limiting for federation routes
- [x] Validate wallet format in token gate middleware
- [x] Add federation E2E regression coverage + coverage reporting workflow
- [x] Add hardening-specific E2E tests (SSRF, signatures, trust gating, rate limits)

**Configuration:**
- `DHT_REQUIRE_SIGNED_ANNOUNCEMENTS`: Set to `false` to allow unsigned announcements (default: true)
- `FEDERATION_TRUST_GATING`: Set to `false` to disable trust level checks (default: true)
- `FEDERATION_REQUIRE_SIGNATURES`: Set to `false` to allow unsigned memory imports (default: true)
- `FEDERATION_RATE_LIMIT_WINDOW_MS`: Rate limit window in ms (default: 60000)
- `FEDERATION_RATE_LIMIT_MAX`: Max requests per window (default: 60)
- `FEDERATION_RATE_LIMIT_MEMORY_MAX`: Max memory ops per window (default: 10)
- `FEDERATION_MAX_BODY_SIZE`: Max body size in bytes (default: 5MB)
- `FEDERATION_MAX_MEMORY_IMPORT_SIZE`: Max import body size (default: 10MB)

---

## Phase 1: Federation Protocol Foundation ✅ COMPLETE

Completed. Details: `docs/ROADMAP-COMPLETED.md`.

---

## Phase 2: Memory Sharing Network ✅ COMPLETE

Completed. Details: `docs/ROADMAP-COMPLETED.md`.

---

## Phase 3: AI Enhancements

Improve memory retrieval, embedding quality, and model flexibility.

### 3.1 Enhanced RAG Pipeline
- **File:** `server/services/rag-service.js` (new)
- Hybrid search: combine vector similarity + keyword + graph traversal
- Context window optimization (dynamic context sizing)
- Memory relevance scoring with recency decay
- Citation tracking in responses

### 3.2 Embedding Improvements (Ollama-Only)
- **File:** `server/services/embedding-service.js` (modify)
- Local embeddings via Ollama (self-hosted philosophy)
- Support multiple Ollama models (nomic-embed-text, mxbai-embed-large, etc.)
- Configurable embedding dimensions per model
- Batch processing for large memory imports
- Embedding versioning (re-embed on model change)

### 3.3 Multi-Model Orchestration
- **File:** `server/services/ai-orchestrator.js` (new)
- Model routing based on task type
- Fallback chains (try Claude → OpenAI → local)
- Cost tracking per provider
- Response quality metrics

### 3.4 Memory Graph Enhancements
- Automatic relationship extraction from chat
- Entity linking (connect mentions to known entities)
- Temporal reasoning (when did I learn X?)
- Contradiction detection

**Key Files to Modify:**
- `server/services/prompt-executor.js` (integrate RAG)
- `server/services/memory-query-service.js` (hybrid search)
- `config/ai-providers.json` (multi-model config)

---

## Phase 4: Plugin Ecosystem Expansion

Enhance the plugin system for community contributions.

### 4.1 Plugin Marketplace
- **File:** `server/services/plugin-marketplace-service.js` (new)
- Plugin discovery registry (JSON file or decentralized)
- Version compatibility checking
- Automatic update notifications
- Plugin ratings/reviews (stored in Neo4j)

### 4.2 Plugin Capabilities API
- Define capability contracts for plugins
- Memory access API for plugins
- Chat context injection API
- Cross-plugin communication

### 4.3 Community Plugin Ideas
- `void-plugin-chat` - Federation-based chat (from Void-Chat patterns)
- `void-plugin-knowledge` - Wikipedia/docs ingestion
- `void-plugin-calendar` - Event scheduling with memory
- `void-plugin-analytics` - Usage and engagement metrics

---

## Phase 5: UI/UX Improvements

Enhance the client experience.

### 5.1 Memory Visualization
- 3D knowledge graph explorer (enhance existing)
- Timeline view for memory evolution
- Memory clusters by topic/category
- Relationship path visualization

### 5.2 Chat Enhancements
- Branch comparison view
- Memory citation highlights
- Thinking block expansion controls
- Voice input/output support

### 5.3 Federation Dashboard
- Connected peers visualization
- Memory sync status
- Token stake/balance display
- Network health metrics

---

## Implementation Order (Recommended)

1. **Federation Security Hardening** (Phase 2.5)
   - Address current security gaps before expanding usage
   - Files: federation routes + token gate + DHT + memory sync + wallet routes

2. **Federation Foundation** (Phase 1.1-1.4)
   - Establishes the network primitives needed for everything else
   - Files: ~3 new services, route additions

3. **AI Enhancements - RAG** (Phase 3.1-3.2)
   - Immediate value improvement for existing users
   - Files: 2 new services, modify existing

4. **Memory Sharing Core** (Phase 2.1)
   - Basic export/import without token gating
   - Files: 1 new service, modify memory-service

5. **Token Integration** (Phase 2.2-2.3)
   - Add economic layer once sharing works
   - Files: 2 new services, wallet plugin changes

6. **Multi-Model & Orchestration** (Phase 3.3-3.4)
   - Enhanced AI capabilities
   - Files: 1 new service, provider modifications

7. **Plugin Marketplace** (Phase 4.1-4.2)
   - Community growth features
   - Files: 1 new service, plugin system enhancements

---

## Architecture Decisions

### Why Neo4j for Federation?
- Already the memory store
- Native graph traversal for relationship queries
- Can store peer relationships and trust graphs
- Existing backup/restore infrastructure

### Why Not Full Chat Integration?
- User specified federation-only approach
- Keep void-server focused on AI memory
- Void-Chat can remain separate for messaging
- Server-to-server focus enables memory sharing without user chat complexity

### Token Economics Rationale (Write-Gating)
- **500K threshold for read**: Creates baseline demand, aligns with disciple tier
- **Stake/burn/spend to write**: Multiple commitment paths for contributors
- **Slash for bad data**: Community governance with economic consequences
- **Treasury spend option**: Sustainable funding for network development

---

## Critical Files Reference

| Component | Key Files |
|-----------|-----------|
| Server Entry | `server/index.js` |
| Memory System | `server/services/memory-service.js`, `memory-query-service.js` |
| Neo4j Layer | `server/services/neo4j-service.js` |
| AI Providers | `server/services/ai-provider.js`, `prompt-executor.js` |
| Embeddings | `server/services/embedding-service.js` |
| Wallet Plugin | `plugins/void-plugin-wallet/` |
| Plugin System | `server/plugins.js` |
| IPFS | `server/services/ipfs-service.js` |
| Client App | `client/src/App.jsx` |
| Memories Page | `client/src/pages/MemoriesPage.jsx` |

---

## Decisions Made

- **Discovery**: DHT-based (decentralized, Kademlia-style)
- **Token threshold**: 500K $CLAWED for read access (disciple level)
- **Write access**: Stake, burn, or spend $CLAWED
- **Embeddings**: Ollama-only (self-hosted)

---

## Completed Milestones

Completed milestones have been moved to `docs/ROADMAP-COMPLETED.md` to keep this plan focused on active work.

---

## Future Ideas

### Federation Bootstrap NPM Package
Create a shared `@clawedcode/federation-bootstrap` npm package to make it easy for any Node.js server to participate in the DHT network:

```javascript
import { createFederationBootstrap } from '@clawedcode/federation-bootstrap'

// Add to any Express app
const federation = createFederationBootstrap({
  dataDir: './data/federation',
  capabilities: ['dht-bootstrap']
})

app.use('/api/federation', federation.routes)
```

**Benefits:**
- Zero-config DHT participation
- Shared codebase between void-server, void-mud, and third-party apps
- Versioned identity management
- Standardized federation protocol

### Next Up
- [ ] Phase 3: AI Enhancements (RAG, embeddings, multi-model)
