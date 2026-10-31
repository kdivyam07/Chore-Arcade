/**
 * @module middleware/security
 * @description Express middleware for origin validation, session enforcement and
 * centralised error handling. All three are designed to be composable and to
 * return consistent JSON error shapes.
 */

import { session } from '../services/session.js';

// ─── Session guard ────────────────────────────────────────────────────────────

/**
 * Require a valid session cookie on the request.
 * Attaches the session record to `req.session` on success.
 * Responds with 401 when no valid session is found.
 *
 * @param {import('express').Request}  req  - Incoming request.
 * @param {import('express').Response} res  - Outgoing response.
 * @param {import('express').NextFunction} next - Next middleware.
 */
export function requireSession(req, res, next) {
  req.session = session(req);
  if (!req.session) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Start a demo or connect Gmail first.',
      },
    });
  }
  next();
}

// ─── Origin validation ────────────────────────────────────────────────────────

/**
 * Validate the `Origin` header for state-mutating requests (non-GET/HEAD/OPTIONS).
 * Allows requests from the configured `APP_ORIGIN` env var or from the same host
 * that served the page (covers Vercel preview deployments automatically).
 *
 * @param {import('express').Request}  req  - Incoming request.
 * @param {import('express').Response} res  - Outgoing response.
 * @param {import('express').NextFunction} next - Next middleware.
 */
export function origin(req, res, next) {
  // Safe methods do not mutate state — no CSRF risk.
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const requestOrigin = req.headers.origin;
  if (!requestOrigin) return next();

  const allowedOrigin = process.env.APP_ORIGIN || 'http://localhost:8080';
  const host = req.headers.host;
  const isSameHost =
    host &&
    (requestOrigin === `https://${host}` || requestOrigin === `http://${host}`);

  if (requestOrigin !== allowedOrigin && !isSameHost) {
    return res.status(403).json({
      error: {
        code: 'ORIGIN_DENIED',
        message: 'Request origin is not allowed',
      },
    });
  }

  next();
}

// ─── Error handler ────────────────────────────────────────────────────────────

/**
 * Centralised Express error handler.
 * - Zod validation errors → 400 INVALID_REQUEST
 * - Errors with a `status` property → that HTTP status
 * - Everything else → 502 REQUEST_FAILED
 * Server errors (5xx) return a generic message to avoid leaking internals.
 *
 * @param {Error}                      err  - The thrown error.
 * @param {import('express').Request}  _req - Unused request (required signature).
 * @param {import('express').Response} res  - Outgoing response.
 * @param {import('express').NextFunction} _next - Unused next (required signature).
 */
export function errors(err, _req, res, _next) {
  const status = err.name === 'ZodError' ? 400 : (err.status || 502);
  const code = status === 400 ? 'INVALID_REQUEST' : 'REQUEST_FAILED';
  const message =
    status >= 500
      ? 'Operation failed. Please retry; completed actions will not be duplicated.'
      : err.message;

  res.status(status).json({ error: { code, message } });
}
