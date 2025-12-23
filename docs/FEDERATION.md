# Federation Guide

This guide explains how to connect void-server instances and share memories across the federation network.

## Overview

Federation enables multiple void-server instances to:
- Discover and connect to each other
- Share memories across the network
- Build trust relationships between peers
- Pin memories to IPFS for decentralized storage

## Getting Your Connection Info

### Via the UI

1. Navigate to **Federation** in the sidebar
2. In the **Server Identity** card, you'll see:
   - **Server ID**: Your unique identifier (e.g., `void-a1b2c3d4`)
   - **Public Key**: Your Ed25519 public key for cryptographic verification
3. Click **Copy Connection Info** to copy all details as JSON

### Via API

```bash
# Get your server manifest
curl http://localhost:4420/api/federation/manifest

# Response:
{
  "success": true,
  "manifest": {
    "serverId": "void-a1b2c3d4",
    "publicKey": "base64-encoded-public-key",
    "version": "0.16.0",
    "capabilities": ["memory", "neo4j", "ipfs", "wallet"]
  }
}
```

## Connecting to a Peer

### What You Need

To connect to another void-server, you need their **endpoint URL**:
- The full URL where their server is accessible
- Example: `https://peer.example.com:4420` or `http://192.168.1.100:4420`

> **Note**: Currently, connections require the endpoint URL. Direct connection via Node ID alone is planned for a future release with full DHT routing.

### Via the UI

1. Go to **Federation** in the sidebar
2. In the **Add Peer** card, enter the peer's endpoint URL
3. Click **Connect**
4. The peer will appear in the **Peers** table below

### Via API

```bash
# Add a peer by endpoint
curl -X POST http://localhost:4420/api/federation/peers \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "https://peer.example.com:4420"}'

# Response:
{
  "success": true,
  "peer": {
    "serverId": "void-b2c3d4e5",
    "publicKey": "...",
    "capabilities": ["memory", "neo4j"],
    "trustLevel": "unknown"
  }
}
```

## Sharing Connection Info

To let someone connect to your server, share:

1. **Your endpoint URL** - The URL where your server is accessible
   - For local network: `http://your-local-ip:4420`
   - For internet: Your public URL or domain

2. **Your connection info** (optional, for verification):
   ```json
   {
     "serverId": "void-a1b2c3d4",
     "publicKey": "your-base64-public-key",
     "endpoint": "https://your-server.com:4420"
   }
   ```

### Network Requirements

For peers to connect to you:
- Your server must be reachable from their network
- Port 4420 (or your configured port) must be accessible
- For internet peers: configure port forwarding or use a reverse proxy

## Trust Levels

Peers progress through trust levels based on interactions:

| Level | Description |
|-------|-------------|
| `unknown` | New peer, not yet verified |
| `seen` | Peer has been contacted |
| `verified` | Peer completed challenge-response verification |
| `trusted` | Manually trusted or high reputation |
| `blocked` | Blocked from federation |

### Managing Trust

```bash
# Verify a peer (challenge-response)
curl -X POST http://localhost:4420/api/federation/verify-peer \
  -H "Content-Type: application/json" \
  -d '{"serverId": "void-b2c3d4e5"}'

# Block a peer
curl -X POST http://localhost:4420/api/federation/peers/neo4j/void-b2c3d4e5/block \
  -H "Content-Type: application/json" \
  -d '{"reason": "Spam"}'

# Unblock a peer
curl -X POST http://localhost:4420/api/federation/peers/neo4j/void-b2c3d4e5/unblock
```

## Sharing Memories

### Export Memories

```bash
# Export all memories (with signature for verification)
curl -X POST http://localhost:4420/api/federation/memories/export \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'

# Export by category
curl -X POST http://localhost:4420/api/federation/memories/export \
  -H "Content-Type: application/json" \
  -d '{"category": "emergence", "limit": 50}'

# Export high-importance memories
curl -X POST http://localhost:4420/api/federation/memories/export \
  -H "Content-Type: application/json" \
  -d '{"minImportance": 0.8}'
```

### Import Memories

```bash
# Preview import (dry run)
curl -X POST http://localhost:4420/api/federation/memories/import \
  -H "Content-Type: application/json" \
  -d '{"exportData": {...}, "dryRun": true}'

# Import memories
curl -X POST http://localhost:4420/api/federation/memories/import \
  -H "Content-Type: application/json" \
  -d '{"exportData": {...}}'
```

### Delta Sync with Peer

```bash
# Sync only new memories since last sync
curl -X POST http://localhost:4420/api/federation/memories/sync/void-b2c3d4e5
```

## Token-Gated Access

Memory sharing can be gated by $CLAWED token balance:

| Action | Required Tier | Token Balance |
|--------|--------------|---------------|
| Read shared memories | DISCIPLE | 500,000 |
| Write to federation | ACOLYTE | 1,000,000 |
| Manage peers | ACOLYTE | 1,000,000 |
| Admin functions | ARCHITECT | 10,000,000 |

```bash
# Check access for a wallet
curl "http://localhost:4420/api/federation/token-gate/check?wallet=YOUR_WALLET&feature=federation:read_memories"

# Use gated endpoints with wallet header
curl -X POST http://localhost:4420/api/federation/gated/memories/export \
  -H "X-Wallet-Address: YOUR_WALLET" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50}'
```

## IPFS Memory Distribution

Pin memories to IPFS for permanent, decentralized storage:

```bash
# Get IPFS stats
curl http://localhost:4420/api/federation/ipfs/stats

# Pin a specific memory
curl -X POST http://localhost:4420/api/federation/ipfs/pin/MEMORY_ID

# Pin multiple memories as a collection
curl -X POST http://localhost:4420/api/federation/ipfs/pin-collection \
  -H "Content-Type: application/json" \
  -d '{"memoryIds": ["mem1", "mem2"], "name": "my-collection"}'

# Auto-pin high quality memories
curl -X POST http://localhost:4420/api/federation/ipfs/auto-pin \
  -H "Content-Type: application/json" \
  -d '{"threshold": 10, "limit": 50}'

# Import memory from IPFS by CID
curl -X POST http://localhost:4420/api/federation/ipfs/import/QmXYZ... \
  -H "Content-Type: application/json"

# Publish to Pinata for wider distribution
curl -X POST http://localhost:4420/api/federation/ipfs/publish-pinata/MEMORY_ID
```

## Memory Marketplace

Track quality and reputation for federated memories:

```bash
# Get marketplace stats
curl http://localhost:4420/api/federation/marketplace/stats

# Get top quality memories
curl http://localhost:4420/api/federation/marketplace/top-memories

# Get top contributors
curl http://localhost:4420/api/federation/marketplace/top-contributors

# Vote on a memory
curl -X POST http://localhost:4420/api/federation/marketplace/memory/MEMORY_ID/vote \
  -H "Content-Type: application/json" \
  -d '{"vote": 1, "voterId": "void-a1b2c3d4"}'
```

### Quality Scoring

Memories are scored based on:
- Views: +0.1 per view
- Interactions: +0.5 per use in chat
- Citations: +2.0 per citation
- Upvotes: +1.0 each
- Downvotes: -1.5 each
- Age decay: 0.99 daily multiplier

### Reputation Tiers

Contributors earn reputation based on their shared memories:

| Tier | Reputation |
|------|------------|
| NEWCOMER | 0+ |
| CONTRIBUTOR | 100+ |
| TRUSTED | 500+ |
| EXPERT | 1,000+ |
| SAGE | 5,000+ |

## Troubleshooting

### Peer won't connect

1. Verify the endpoint URL is correct and accessible
2. Check if the peer's server is running
3. Ensure no firewall is blocking port 4420
4. Try pinging: `curl https://peer.example.com:4420/api/federation/ping`

### Memory import fails

1. Check if the export signature is valid
2. Verify the source server is not blocked
3. Check for duplicate memories (same content hash)

### IPFS pinning fails

1. Verify IPFS daemon is running: check Federation → IPFS stats
2. Check IPFS gateway connectivity
3. For Pinata: ensure JWT is configured in `data/ipfs.json`

## API Reference

See the full API at `/api/federation/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/manifest` | GET | Get server identity |
| `/status` | GET | Get federation status |
| `/peers` | GET/POST | List or add peers |
| `/peers/neo4j` | GET | List Neo4j peers |
| `/dht/status` | GET | Get DHT network status |
| `/memories/export` | POST | Export memories |
| `/memories/import` | POST | Import memories |
| `/ipfs/stats` | GET | Get IPFS stats |
| `/ipfs/pin/:id` | POST | Pin memory to IPFS |
| `/marketplace/stats` | GET | Get marketplace stats |
| `/token-gate/config` | GET | Get token gate config |
