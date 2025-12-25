# Security

Security practices and controls for void-server.

## Sensitive Data Protection

All sensitive data is stored in the `data/` directory, which is excluded from version control.

| File | Purpose | Protection |
|------|---------|------------|
| `data/.secret-key` | AES-256-GCM master encryption key | gitignored, 0600 permissions |
| `data/wallets/wallets.json` | Wallet seed phrases | gitignored + encrypted |
| `data/models/id_ed25519` | SSH private key for model downloads | gitignored |
| `data/federation-session.json` | Federation auth token | gitignored |
| `data/ai-providers.json` | API key configuration | gitignored |

## Encryption

Wallet seed phrases are encrypted using:

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Random 64 bytes per encryption
- **IV**: Random 16 bytes per encryption
- **Implementation**: `server/services/wallet/encryption.js`

The master encryption key is generated on first run and stored with restrictive permissions (0600).

## Pre-commit Secret Scanning

A pre-commit hook scans staged files for secrets before allowing commits.

### Installation

```bash
bash .githooks/install-hooks.sh
```

### Detected Patterns

- AWS access keys and secrets
- GitHub tokens (ghp_, gho_, ghu_, ghs_, ghr_, github_pat_)
- OpenAI API keys (sk-*)
- Anthropic API keys (sk-ant-*)
- Slack tokens (xox*)
- Google API keys (AIza*)
- Private key headers (-----BEGIN * PRIVATE KEY-----)
- Generic secrets (password=, secret=, api_key=, etc.)
- JWT tokens

### Configuration

- **Patterns**: `scripts/lib/secret-patterns.txt`
- **Allowlist**: `config/secrets-allowlist.json`

### Bypass (Not Recommended)

```bash
git commit --no-verify
```

## API Key Handling

API keys for AI providers are stored encrypted in `data/ai-providers.json`:

```javascript
{
  "openai": { "encryptedApiKey": "..." },
  "anthropic": { "encryptedApiKey": "..." }
}
```

Keys can also be provided via environment variables:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `SOLANA_RPC_URL`
- `JUPITER_API_KEY`

## Federation Security

Federation authentication uses:

- **Wallet Signatures**: Ed25519 signatures verify wallet ownership
- **Token Gating**: 500K+ CLAWED balance required for network participation
- **Session Tokens**: Stateless HMAC-signed tokens (7-day expiry)
- **Replay Prevention**: Auth messages expire after 5 minutes

See [FEDERATION.md](./FEDERATION.md) for details.

## File Permissions

Critical files use restrictive permissions:

```
data/.secret-key          0600 (owner read/write only)
data/models/id_ed25519    0600 (owner read/write only)
```

## Audit Checklist

To verify security posture:

```bash
# Check for tracked secret files
git ls-files --cached | grep -E "(secret|\.key|\.pem)"

# Check git history for deleted secrets
git log --all --full-history -- "*.key" "*secret*" "*.pem"

# Verify .gitignore excludes data/
grep "data/\*" .gitignore

# Test pre-commit hook
echo 'sk-test1234567890abcdef' > test.txt
git add test.txt
git commit -m "test"  # Should be blocked
rm test.txt
```

## Reporting Issues

If you discover a security vulnerability, please report it privately rather than opening a public issue.
