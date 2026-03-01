/**
 * DataFast Analytics Proxy - Cloudflare Worker
 *
 * Proxies DataFast analytics through your own domain to bypass adblockers
 * and improve tracking accuracy.
 *
 * Routes:
 *   /js/script.js  -> datafa.st/js/script.js
 *   /api/events    -> datafa.st/api/events (with real IP forwarding)
 */

const DATAFAST_HOST = 'datafa.st'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/js/script.js') {
      return proxyScript(request)
    }

    if (path === '/api/events') {
      return proxyEvents(request)
    }

    return new Response('Not Found', { status: 404 })
  },
}

async function proxyScript(request: Request): Promise<Response> {
  const targetUrl = `https://${DATAFAST_HOST}/js/script.js`

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: filterHeaders(request.headers),
  })

  const newHeaders = new Headers(response.headers)
  newHeaders.set('Cache-Control', 'public, max-age=86400')

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  })
}

async function proxyEvents(request: Request): Promise<Response> {
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'

  const targetUrl = `https://${DATAFAST_HOST}/api/events`

  const headers = filterHeaders(request.headers)
  headers.set('x-datafast-real-ip', clientIp)
  headers.set('Host', DATAFAST_HOST)

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' ? request.body : undefined,
  })

  const newHeaders = new Headers(response.headers)
  setCorsHeaders(newHeaders)

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  })
}

function filterHeaders(original: Headers): Headers {
  const headers = new Headers()
  const skip = new Set(['host', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor', 'cdn-loop'])

  for (const [key, value] of original.entries()) {
    if (!skip.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  }

  return headers
}

function setCorsHeaders(headers: Headers): void {
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
}
