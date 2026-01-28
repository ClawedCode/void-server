# Security Audit: Federation + Memory Sharing (2026-01-28)

Scope: federation peer discovery, messaging, memory export/import/sync, relay controls, and wallet routes used in federation flows.

## High-Level Summary
The federation surface is currently exposed without authentication or authorization. Several routes allow untrusted callers to modify trust state, add peers, or export/import memories. Token gating is also bypassed due to feature-name mismatches. DHT endpoints accept unauthenticated announcements, enabling routing table poisoning and SSRF.

## Findings

### Critical
- **Federation endpoints lack authN/authZ**
  - Evidence: federation routes mounted without auth in `server/index.js` and most `/api/federation/*` handlers do not check permissions.
  - Impact: any reachable client can add/remove peers, modify trust, and export/import memories.

- **Token gate bypass due to feature-name mismatch**
  - Evidence: routes use `federation:read_memories`, `federation:write_memories`, `federation:sync_peers` but `FEATURE_GATES` defines only `federation:relay_auth`, `federation:sync_memories`, `federation:admin`.
  - Impact: `checkAccess` allows unknown features, so “gated” memory endpoints are effectively open.

### High
- **SSRF via peer add + DHT traffic to untrusted endpoints**
  - Evidence: `/api/federation/peers` fetches remote manifest from attacker-supplied endpoint; DHT announce/ping/find-node uses endpoints accepted without validation.
  - Impact: outbound requests to internal services, metadata endpoints, or network scanning.

- **DHT routing table poisoning / nodeId spoofing**
  - Evidence: `nodeId` accepted from input without verifying it matches `sha256(publicKey)`.
  - Impact: eclipse attacks, routing manipulation, and malicious peer injection.

### Medium
- **Challenge-response can be used as a signing oracle**
  - Evidence: `/verify/respond` signs arbitrary challenges without tracking issuance, `/verify/complete` accepts any challenge without nonce tracking.
  - Impact: attacker can harvest signatures or upgrade trust without mutual verification.

- **Memory sharing via secure message ignores trust + signature optional**
  - Evidence: `memory_query` and `memory_share` do not enforce trust level; `importMemories` allows unsigned memories by default.
  - Impact: untrusted peers can inject content or trigger heavy processing.

- **Resource exhaustion on memory import**
  - Evidence: large imports trigger embedding generation and database writes with no payload or rate limits.
  - Impact: DoS by large export payloads.

### Low
- **Token-gate middleware does not validate wallet format**
  - Evidence: `requireTokens` calls `checkAccess` without `isValidWallet` validation.
  - Impact: malformed wallet can throw errors and cause 500s.

## Recommended Remediation (Prioritized)

### P0 (Blocker)
1. Require authN/authZ for federation admin and memory routes (mTLS, JWT, or HMAC-based shared secret).
2. Fix token gate feature mapping; fail closed on unknown feature keys.

### P1 (High)
3. Validate and allowlist peer endpoints; block private ranges unless explicitly trusted.
4. Verify `nodeId` = `sha256(publicKey)` for DHT announce/peer-push/find-node.

### P2 (Medium)
5. Track challenges server-side with TTL; bind to requester; reject unknown/replayed challenges.
6. Require verified/trusted peers for memory export/import; require signatures by default.
7. Add payload size limits, quotas, and rate limiting for federation import/export.

### P3 (Low)
8. Validate wallet format in `requireTokens` and return 400 on invalid addresses.

## Proposed Work Items
- Add `federationAuth` middleware with role-based access (admin vs peer vs local).
- Implement `isAllowedEndpoint` + IP range checks for outbound fetches.
- DHT: recompute nodeId from publicKey and reject mismatches; require signed announcements.
- Default `importMemories` to `requireSignatures: true` and enforce trust-level checks.
- Add body size limits and rate limiting on federation routes.

