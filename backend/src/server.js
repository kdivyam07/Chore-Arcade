/**
 * @module server
 * @description Express application entry point.
 * Configures security headers, CORS, request compression, JSON parsing,
 * static-file serving with long-lived cache headers and the API router.
 * When executed directly (not imported as a module), also starts the HTTP listener.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import routes from './routes/api.js';
import { origin, errors } from './middleware/security.js';

// Load .env file when running locally. Silently ignored in production (Vercel
// injects env vars directly) and when the file is absent.
try {
  process.loadEnvFile();
} catch {
  void 0;
}

export const app = express();

// ─── Trust proxy ──────────────────────────────────────────────────────────────

// Required for accurate IP detection behind Vercel / cloud load-balancers.
app.set('trust proxy', 1);

// ─── Security headers ─────────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
      },
    },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.APP_ORIGIN || 'http://localhost:8080',
    credentials: true,
  }),
);

// ─── Response compression ─────────────────────────────────────────────────────

// Gzip / Brotli compress all responses above the default threshold (1 KB).
// Improves transfer speed and Lighthouse performance scores.
app.use(compression());

// ─── Body parsing ─────────────────────────────────────────────────────────────

// Limit JSON bodies to 64 KB to mitigate large-payload attacks.
app.use(express.json({ limit: '64kb' }));

// ─── Custom origin guard ──────────────────────────────────────────────────────

app.use(origin);

// ─── API routes ───────────────────────────────────────────────────────────────

app.use('/api', routes);

// Catch unmatched /api/* paths before falling through to the SPA.
app.use('/api', (_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API endpoint not found' } }),
);

// ─── Static files ─────────────────────────────────────────────────────────────

// Serve Vite-built assets with aggressive caching (content-addressed filenames).
// HTML entry point is served separately with no-cache to ensure fresh app shell.
app.use(
  express.static(resolve('frontend/dist'), {
    maxAge: '1y',
    etag: true,
    immutable: true,
    // Override cache for the HTML shell — must always be fresh.
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }),
);

// SPA fallback: serve index.html for all non-API client-side routes.
app.get('/{*path}', (_req, res) => res.sendFile(resolve('frontend/dist/index.html')));

// ─── Error handler ────────────────────────────────────────────────────────────

app.use(errors);

// ─── Start listener ───────────────────────────────────────────────────────────

// Only bind the port when this file is the process entry-point.
// When imported by the Vercel serverless handler (api/index.js), the listener
// is managed by the platform and must NOT be started here.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT) || 8080;
  app.listen(port, '0.0.0.0', () =>
    console.log(`Chore Arcade listening on port ${port}`),
  );
}
