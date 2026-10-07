# DataFast Analytics Proxy — Cloudflare Worker

<a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

Proxy [DataFast](https://datafa.st) analytics through your own domain using a Cloudflare Worker.  
Bypasses adblockers and improves tracking accuracy.

## One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Cap-go/datafast-cloudflare-proxy)

## How It Works

| Your Domain | Proxied To |
|---|---|
| `yourdomain.com/js/script.js` | `datafa.st/js/script.js` |
| `yourdomain.com/api/events` | `datafa.st/api/events` |

The worker automatically forwards the visitor's real IP address via the `x-datafast-real-ip` header using Cloudflare's `cf-connecting-ip`.

## Manual Setup

### 1. Clone this repo

```bash
git clone https://github.com/Cap-go/datafast-cloudflare-proxy
cd datafast-cloudflare-proxy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure (optional)

Edit `wrangler.toml` to set a custom worker name or add a custom domain/route:

```toml
name = "datafast-proxy"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Optional: use a custom domain
# routes = [
#   { pattern = "analytics.yourdomain.com/*", zone_name = "yourdomain.com" }
# ]
```

### 4. Deploy

```bash
npx wrangler deploy
```

### 5. Update your script tag

Replace your existing DataFast script tag with the proxied version:

```html
<script
  defer
  data-website-id="dfid_******"
  data-domain="yourdomain.com"
  src="https://your-worker.your-subdomain.workers.dev/js/script.js"
></script>
```

Or if using a custom domain:

```html
<script
  defer
  data-website-id="dfid_******"
  data-domain="yourdomain.com"
  src="https://analytics.yourdomain.com/js/script.js"
></script>
```

## Custom API Endpoint

If you already have an `/api/events` endpoint, you can configure DataFast to use a different path by adding `data-api-url` to your script tag:

```html
<script
  defer
  data-website-id="dfid_******"
  data-domain="yourdomain.com"
  data-api-url="/datafast-events"
  src="https://your-worker.your-subdomain.workers.dev/js/script.js"
></script>
```

Then update `src/index.ts` to handle `/datafast-events` instead of `/api/events`.

## Verification

1. Visit your website
2. Open the **Network** tab in your browser's developer tools
3. Confirm analytics requests go through your domain (not `datafa.st`)

## Troubleshooting

### All visitors showing from the same location

This means visitor IPs aren't being forwarded correctly. This worker uses Cloudflare's `cf-connecting-ip` header which should work automatically. If issues persist:

- Make sure you're not behind an additional proxy that strips headers
- Check that the `x-datafast-real-ip` header is being sent correctly
- [Contact DataFast support](mailto:support@datafa.st?subject=Analytics%20showing%20same%20location%20for%20all%20visitors)

## Local Development

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8787`.

## License

MIT

## Affonso proxy (`aff` worker)

`src/aff.ts` with `wrangler.aff.toml` is the Capgo production worker `aff` that serves `aff.capgo.app` and proxies the [Affonso](https://affonso.io) affiliate pixel and APIs (`/r/pixel.js`, `/r/track`, `/r/signups`, plus legacy paths). Unknown paths return 404 and the visitor IP is forwarded via `X-Forwarded-For`.

```bash
npm run deploy:aff
```
