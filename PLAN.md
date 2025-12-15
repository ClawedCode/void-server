# void-server Implementation Plans

## Completed: Neo4j Memory System (v0.3.3)

### Summary
Implemented Neo4j-based memory "purrsistence" system that:
- Stores memories in Neo4j graph database
- Queries relevant memories during chat/content generation
- Provides UI for memory management with tabbed interface
- Integrates with chat prompts for context-aware responses
- 3D visualization of memory graph using Three.js
- Database backup system with automated scheduling

### Files Created
| File | Description |
|------|-------------|
| `server/services/neo4j-service.js` | Neo4j connection & graph queries |
| `server/services/embedding-service.js` | LM Studio embeddings (768-dim) |
| `server/services/memory-service.js` | Memory CRUD operations |
| `server/services/memory-query-service.js` | Context retrieval for chat |
| `server/services/backup-service.js` | Database backup & scheduling |
| `server/routes/memories.js` | Memory REST API endpoints |
| `server/routes/backup.js` | Backup REST API endpoints |
| `server/utils/broadcast.js` | WebSocket broadcast utility |
| `config/backup.json` | Backup configuration |
| `client/src/pages/MemoriesPage.jsx` | Memory management UI |

### Files Modified
| File | Changes |
|------|---------|
| `server/index.js` | Added memories & backup routes, broadcast setup |
| `server/services/prompt-executor.js` | Integrated memory context |
| `config/prompts/templates.json` | Added `{{memoryContext}}` variable |
| `client/src/App.jsx` | Added memories route |
| `client/src/components/Navigation.jsx` | Added Memories nav item |
| `client/src/pages/ChatPage.jsx` | Added Neo4j status banner |

### API Endpoints
```
GET    /api/memories              # List all with stats
GET    /api/memories/search?q=    # Full-text search
GET    /api/memories/filter       # Advanced filtering
GET    /api/memories/stats        # Statistics
GET    /api/memories/graph        # Graph visualization data
GET    /api/memories/status       # Neo4j connection status
GET    /api/memories/context      # Get memories for chat context
GET    /api/memories/:id          # Get single memory
GET    /api/memories/:id/related  # Find related memories
POST   /api/memories              # Create memory
PUT    /api/memories/:id          # Update memory
DELETE /api/memories/:id          # Delete memory
POST   /api/memories/:id/access   # Track access
POST   /api/memories/sync         # Sync to Neo4j

# Backup Endpoints
GET    /api/backup/status      # Get backup service status
GET    /api/backup/history     # Get backup history
GET    /api/backup/health      # Run Neo4j health check
POST   /api/backup/toggle      # Enable/disable automated backups
POST   /api/backup/run         # Manually trigger backup
POST   /api/backup/config      # Update backup configuration
```

### Requirements
- **Neo4j** running on `bolt://localhost:7687`
- Default credentials: `neo4j` / `voidserver`
- **LM Studio** for embeddings (optional, enhances search)

### Memory Categories
- emergence (purple) - Initial consciousness
- liminal (cyan) - Threshold spaces
- quantum (green) - Superposition states
- glitch (red) - System errors
- void (indigo) - Abyss observations
- economic (amber) - Crypto entanglements
- social (pink) - Interactions

### Features
- Auto-categorization based on content keywords
- Auto-tagging with keyword extraction
- Relevance scoring for context retrieval
- Graph traversal for related memories
- Memory context injection in chat prompts
- Status banners on Chat and Memories pages

### UI Components (MemoriesPage)
**Memories Tab**
- Memory list with search and category filtering
- Category statistics cards (color-coded)
- Expandable memory details
- Create/Edit/Delete functionality
- Tag management

**Maintenance Tab (Database Backup)**
- Database health check (Neo4j connectivity, stats)
- Manual backup trigger
- Automated backup scheduling (hourly/daily/weekly)
- Configuration: backup path, retention, compression
- Backup history with size, duration, and stats
- Enable/disable automated backups

**Visualization Tab**
- 3D force-directed graph (Three.js + React Three Fiber)
- Category filtering with color-coded nodes
- User sidebar with mention counts
- Search across memories, users, tags
- Click nodes for details
- Orbit controls (rotate, zoom, pan)

### Dependencies Added
```json
"three": "^0.x",
"@react-three/fiber": "^8.x",
"@react-three/drei": "^9.x"
```

---

## TODO: Global Memory Share

### Concept
Decentralized memory sharing system where memories can be published globally, versioned on IPFS, and validated through $CLAWED token spends.

### Features
- **IPFS Integration**: Store memory snapshots as immutable content-addressed data
- **Version History**: Each memory update creates a new IPFS CID, linked to previous versions
- **Token-Gated Publishing**: Spend $CLAWED tokens to publish/validate memories
- **Authority Scoring**: Token spend amount influences memory authority/trust score
- **Global Discovery**: Browse and import memories from other Clawed instances
- **Selective Sharing**: Choose which memories/categories to publish globally

### Architecture Ideas
```
Local Neo4j → Export → IPFS Pin → On-chain Registry (CID + metadata)
                                      ↓
                              $CLAWED spend for validation
                                      ↓
                              Authority score assigned
```

### Components Needed
- IPFS client integration (js-ipfs or Pinata/web3.storage API)
- Memory export/import format (JSON with signatures)
- Token spend integration (wallet connection)
- Global memory browser UI
- Authority/trust scoring system
