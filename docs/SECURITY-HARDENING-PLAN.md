# Phase 2.5: Federation Security Hardening Plan

Goal: lock down federation and memory-sharing surfaces without breaking existing local/dev workflows. This plan is a concrete implementation guide for the audit in `docs/SECURITY-AUDIT-FEDERATION-2026-01-28.md`.

## Outcomes
- Federation endpoints are authenticated and role-gated.
- Token gating works and fails closed on unknown features.
- SSRF and DHT poisoning risks are reduced.
- Memory imports require signatures + trust and are rate/payload limited.

## Proposed Auth Model (Minimal, Incremental)
- **Mode switch**: `FEDERATION_AUTH_MODE=off|shared_secret` (default: `off`).
- **Tokens**:
  - `FEDERATION_AUTH_TOKEN` (peer token)
  - `FEDERATION_ADMIN_TOKEN` (admin token)
- **Local bypass**: allow loopback when `FEDERATION_AUTH_ALLOW_LOCAL=true` (default true).
- **Headers**:
  - `Authorization: Bearer <token>` (preferred)
  - `X-Federation-Token: <token>` (fallback)

### Role Expectations
- **admin**: peer management, trust updates, DHT bootstrap config, relay wallet changes.
- **peer**: memory export/import/sync and messaging.
- **local**: UI/local tooling when loopback.

## Work Items (Concrete)

### 1) AuthN/AuthZ Scaffold
- Add middleware: `server/middleware/federation-auth.js`.
- Wire to federation router with safe allowlist (`/manifest`, `/identity`, `/ping`).
- Add `requireFederationRole('admin')` to admin-only endpoints.

### 2) Token Gate Fix
- Align feature names across routes and `FEATURE_GATES`:
  - Update routes to use `federation:sync_memories` or expand `FEATURE_GATES`.
- Change `checkAccess` to fail closed on unknown features.
- Validate wallet address in `requireTokens` before RPC calls.

### 3) Endpoint Validation + SSRF Guards
- Add `isAllowedEndpoint(endpoint)`:
  - Allow only `https` by default (configurable).
  - Block RFC1918/loopback/link-local unless explicitly allowlisted.
- Enforce for:
  - `/api/federation/peers` manifest fetch
  - DHT announce/ping/find-node peer endpoints

### 4) DHT Verification
- Verify `nodeId == sha256(publicKey)` on announce/peer-push/find-node.
- Require signed DHT announcements (e.g., signature over `{nodeId, endpoint, publicKey, serverId, ts}`).
- Reject if signature missing/invalid or timestamp expired.

### 5) Challenge-Response Hardening
- Store issued challenges with TTL (e.g., in memory map or data file).
- Bind challenge to requester (serverId + publicKey) and invalidate after use.
- Reject unknown or expired challenges.

### 6) Trust + Signature Enforcement
- Require verified/trusted peers for memory export/import/sync.
- Set `requireSignatures: true` by default on import.
- Provide explicit override (admin only) for legacy peers.

### 7) Rate Limits + Payload Caps
- Add body size limits for federation routes (e.g., 1–5MB).
- Add rate limiting for import/export/sync endpoints.
- Add import quotas (count + size) per peer per interval.

## Acceptance Criteria
- All federation mutation endpoints return 401/403 when unauthenticated in `shared_secret` mode.
- Token gate denies unknown features and invalid wallets.
- DHT rejects nodeId mismatches and unsigned announcements.
- Memory import refuses unsigned memories by default.
- Large payloads or excessive calls are rate-limited.

## Suggested Files
- `server/middleware/federation-auth.js`
- `server/routes/federation.js`
- `server/services/token-gate-service.js`
- `server/services/dht-service.js`
- `server/services/memory-sync-service.js`
- `server/index.js`

