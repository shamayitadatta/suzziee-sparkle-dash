# Environment Variables

## For Local Development

Create a `.env.local` file in the project root:

```env
# API Configuration
VITE_API_HOST=http://localhost:3000

# Feature Flags
DEBUG=false
```

## For Production (Vercel)

Configure these in Vercel Dashboard: **Settings → Environment Variables**

### Available Variables

#### API Configuration
- `VITE_API_HOST` - Base URL for API requests
  - Example: `https://api.example.com`
  - Used in: `src/lib/api.ts`

#### Analytics & Monitoring
- `VITE_SENTRY_DSN` (optional) - Error tracking
- `VITE_ANALYTICS_ID` (optional) - Analytics tracking

#### Feature Flags
- `VITE_DEBUG` - Enable debug logging (default: false)

## TanStack Start Specific

The app uses TanStack Start with SSR. Environment variables prefixed with `VITE_` are exposed to the client-side bundle.

**Important:** Never expose secrets in `VITE_*` variables as they're visible in client code.

For server-only secrets, use regular environment variables without the `VITE_` prefix:
- These are only available on the server
- Add them to Vercel secrets (not regular env vars)

## Vercel Secrets (Server-only)

For sensitive data (API keys, tokens), use Vercel CLI:

```bash
vercel env add DATABASE_URL
vercel env add API_SECRET_KEY
```

Then reference in `src/server.ts` without the `VITE_` prefix.
