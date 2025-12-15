# Remote Access with Tailscale

Access your Void Server from anywhere - your phone, laptop, or any device - using [Tailscale](https://tailscale.com/), a secure mesh VPN.

## Why Tailscale?

- **Zero configuration networking** - No port forwarding, firewall rules, or dynamic DNS
- **End-to-end encryption** - Traffic is encrypted between your devices
- **Works everywhere** - Behind NAT, on cellular, at coffee shops
- **Free for personal use** - Up to 100 devices on the free plan

## Quick Setup

### 1. Install Tailscale on Your Server

**macOS:**
```bash
brew install tailscale
sudo tailscaled &
tailscale up
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**Linux (Docker host):**
```bash
# If running Void Server in Docker, install Tailscale on the host
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**Windows:**
Download and install from [tailscale.com/download](https://tailscale.com/download)

### 2. Install Tailscale on Your Phone/Other Devices

- **iOS**: [App Store](https://apps.apple.com/app/tailscale/id1470499037)
- **Android**: [Play Store](https://play.google.com/store/apps/details?id=com.tailscale.ipn)
- **macOS/Windows/Linux**: [tailscale.com/download](https://tailscale.com/download)

Sign in with the same account on all devices.

### 3. Access Void Server Remotely

Once Tailscale is running on both your server and your device:

1. Find your server's Tailscale IP:
   ```bash
   tailscale ip -4
   # Example output: 100.x.y.z
   ```

2. Access Void Server from any device on your Tailnet:
   ```
   http://100.x.y.z:4401
   ```

That's it! Your Void Server is now accessible from anywhere.

## Using MagicDNS (Optional)

Tailscale can assign friendly hostnames to your devices:

1. Enable MagicDNS in [Tailscale Admin Console](https://login.tailscale.com/admin/dns)
2. Access your server by name:
   ```
   http://your-server-name:4401
   ```

## Docker Considerations

If running Void Server with Docker:

### Option A: Tailscale on Host (Recommended)

Install Tailscale on the Docker host machine. Since Void Server binds to port 4401 on the host, it's automatically accessible via the host's Tailscale IP.

```bash
# On the Docker host
tailscale up
tailscale ip -4  # Get your Tailscale IP

# Access from any device
http://100.x.y.z:4401
```

### Option B: Tailscale in Docker

For advanced users, you can run Tailscale as a sidecar container:

```yaml
# Add to docker-compose.yml
services:
  tailscale:
    image: tailscale/tailscale:latest
    container_name: void-tailscale
    hostname: void-server
    environment:
      - TS_AUTHKEY=tskey-auth-xxx  # Generate at tailscale.com/admin
      - TS_STATE_DIR=/var/lib/tailscale
    volumes:
      - tailscale_data:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    restart: unless-stopped
    network_mode: host

volumes:
  tailscale_data:
```

## Security Notes

- **Tailscale traffic is encrypted** - Safe to use on public WiFi
- **No ports exposed to internet** - Only Tailnet devices can connect
- **Device authorization** - New devices must be approved in your admin console
- **Access controls** - Use Tailscale ACLs to restrict which devices can access what

## Troubleshooting

### Can't connect from phone

1. Ensure Tailscale is running on both devices (check the icon/app)
2. Verify both devices show as "Connected" in the Tailscale app
3. Try the Tailscale IP directly: `http://100.x.y.z:4401`

### Connection refused

1. Verify Void Server is running:
   ```bash
   # Native
   npm run status

   # Docker
   docker-compose ps
   ```

2. Check the server is listening on all interfaces (it should by default)

### Slow connection

Tailscale uses direct connections when possible. If traffic is being relayed:

1. Check connection type: `tailscale status`
2. Ensure UDP port 41641 isn't blocked by firewalls
3. Direct connections are faster than relayed (DERP) connections

## Mobile Tips

- **Add to Home Screen** - In Safari/Chrome, tap Share > Add to Home Screen for app-like access
- **Bookmark the Tailscale IP** - Save `http://100.x.y.z:4401` for quick access
- **Keep Tailscale running** - Enable "Always On VPN" in Tailscale settings for seamless access

## Resources

- [Tailscale Documentation](https://tailscale.com/kb/)
- [Tailscale Download](https://tailscale.com/download)
- [Tailscale Admin Console](https://login.tailscale.com/admin)
