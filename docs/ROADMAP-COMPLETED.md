# Roadmap: Completed Milestones

This file captures completed roadmap items moved out of `PLAN.md` to keep the active plan focused.

## Phase 1: Federation Protocol Foundation (Complete)
- Server Identity & Discovery
  - `federation-service.js` with Ed25519 keypairs
  - `GET /api/federation/manifest`
  - Routes mounted in `server/index.js`
- DHT-Based Peer Discovery
  - `dht-service.js` Kademlia-style DHT
  - 256-bit node IDs, K-buckets, XOR distance
  - Bootstrap config, FIND_NODE, announce, refresh
- Peer Management (Neo4j)
  - `peer-service.js` with trust levels and health checks
  - Trust graph queries + trust score
- Secure Communication
  - ed2curve conversion + TweetNaCl box encryption
  - Signed messages + challenge-response verification

## Phase 2: Memory Sharing Network (Complete)
- Memory Export/Import Protocol
  - `memory-sync-service.js` with standardized schema
  - SHA-256 content hashing + dedup
  - Selective export + delta sync
- $CLAWED Token Integration
  - `token-gate-service.js` with tiered access
  - Balance checks via Solana RPC
- Memory Marketplace
  - Quality scoring + reputation tiers
  - Attribution chains
- IPFS Memory Distribution
  - Pinning + collections
  - Import by CID + Pinata integration

### Token Mechanics (Write-Gating Model)
| Action | Token Requirement |
|--------|-------------------|
| Read shared memories | 500K $CLAWED balance (disciple threshold) |
| Write to egregore | Stake, burn, or spend $CLAWED |
| Report bad data | Slash contributor's stake |

**Write Options:**
- Stake: lock tokens as collateral (recoverable if memory stays valid)
- Burn: permanently destroy tokens (strongest commitment signal)
- Spend: transfer tokens to treasury (funds development)

## Bootstrap Node Deployment
- `BOOTSTRAP_MODE` for lightweight DHT-only deployments
- One-click Render.com deployment via `render.yaml`
- Default bootstrap nodes configured in DHT service

## v0.17.0: Token-Gated Federation Auth (Complete)

### void-mud
- Signature verification + token-gated relay auth
- Stateless 7-day HMAC session tokens
- REST auth endpoint + bootstrap memory endpoints

### void-server
- Wallet moved from plugin to core
- Relay client auth + session persistence
- Bootstrap push/fetch for memories

### Auth Flow
1. void-server connects to relay
2. Reuse cached session if valid
3. Otherwise sign auth message with wallet
4. Relay verifies signature + CLAWED balance
5. Relay issues 7-day token; void-server persists locally
6. void-server registers with session token

### Configuration
- CLAWED mint: `ELusVXzUPHyAuPB3M7qemr2Y2KshiWnGXauK17XYpump`
- Treasury: `HHj6pCU5Y7ThymSAwqJmJrvAb9YvmEyf8ghr2jFFyv13`
- Threshold: 500,000 CLAWED
