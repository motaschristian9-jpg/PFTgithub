---
description: Set up a persistent Cloudflare Tunnel with a custom domain
---

> [!IMPORTANT]
> **Prerequisites:**
> 1. A **Cloudflare Account** (Free).
> 2. A **Domain Name** (like `example.com`) added to your Cloudflare account.
> without a domain, you cannot create a custom named tunnel (e.g. `pft.example.com`).

### 1. Login to Cloudflare
Run this command to authenticate your machine:
```bash
npx cloudflared tunnel login
```
*   It will provide a URL.
*   Copy/Paste that URL into your browser.
*   Select the domain you want to use.
*   It will download a certificate to `~/.cloudflared/cert.pem`.

### 2. Create the Tunnel
Give your tunnel a name (e.g., `pft-tunnel`):
```bash
npx cloudflared tunnel create pft-tunnel
```
*   **Copy the Tunnel-ID** from the output (it looks like `uuid-uuid-uuid`).

### 3. Route the DNS
Tell Cloudflare: "When someone visits `app.mydomain.com`, send them to this tunnel."
```bash
# Syntax: npx cloudflared tunnel route dns <Tunnel-Name> <Subdomain>
npx cloudflared tunnel route dns pft-tunnel pft.yourdomain.com
```

### 4. Run the Tunnel
Connect the tunnel to your local backend/frontend.
```bash
npx cloudflared tunnel run --url http://localhost:5173 pft-tunnel
```
