# void-plugin-verify

Client-side Ed25519 signature verification plugin for void-server.

![Signature Verification](screenshot.png)

## Features

- Verify Solana wallet signatures
- Parse PEM-style signed message blocks
- Auto-verify on input (debounced)
- Pure JavaScript (no native dependencies)
- All verification happens client-side (no server calls)

## Installation

### From the Plugin Manager UI

1. Navigate to the **Plugins** page in void-server
2. Find "void-plugin-verify" in the available plugins list
3. Click **Install**
4. Restart the server when prompted

### Via Command Line

```bash
cd void-server
git submodule add https://github.com/anthropics/void-plugin-verify.git plugins/void-plugin-verify
git submodule update --init --recursive
```

## Usage

This plugin provides a simple UI for verifying Ed25519 signatures from Solana wallets.

### Supported Formats

**PEM-style signed message:**
```
-----BEGIN SIGNED MESSAGE-----
Your message here
-----BEGIN SIGNATURE-----
<public_key>
<signature>
-----END SIGNED MESSAGE-----
```

**SOLANA variant:**
```
-----BEGIN SOLANA SIGNED MESSAGE-----
Your message here
-----BEGIN SOLANA SIGNATURE-----
<public_key>
<signature>
-----END SOLANA SIGNED MESSAGE-----
```

### Manual Input

You can also manually enter:
- **Public Key**: Solana public key (base58 encoded, 32 bytes)
- **Message**: The original message that was signed
- **Signature**: The signature (base58 encoded, 64 bytes)

## Technical Details

- Uses Web Crypto API (SubtleCrypto) for Ed25519 verification
- Pure JavaScript Base58 decoding (no external dependencies)
- All verification happens client-side (no server calls)

## Configuration

Default mount path: `/verify`

Navigation appears as a standalone item (no section grouping).

## License

MIT
