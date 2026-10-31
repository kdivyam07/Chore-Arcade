/**
 * @module routes/api
 * @description Express router that wires all API endpoints to their controller
 * functions. Public endpoints are listed first; session-protected endpoints are
 * grouped behind the {@link requireSession} middleware.
 */

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as c from '../controllers/api.js';
import { requireSession } from '../middleware/security.js';

const router = Router();

// ─── Public endpoints ─────────────────────────────────────────────────────────

/** Health check — used by deployment platforms and monitoring. */
router.get('/health', c.health);

/** Return the current auth state (Google configured, session mode, etc.). */
router.get('/auth/me', c.me);

/** Create a new demo session. */
router.post('/auth/demo', c.demo);

/** Initiate the Google OAuth2 flow. */
router.get('/auth/google', c.google);

/** Handle the OAuth2 redirect callback from Google. */
router.get('/auth/callback', c.callback);

/** Retrieve the global high-score leaderboard. */
router.get('/leaderboard', c.leaderboard);

// ─── Session-protected endpoints ──────────────────────────────────────────────

router.use(requireSession);

/** List available chore types and their point values. */
router.get('/chores', c.chores);

/** Scan Gmail (or demo inbox) and open a new processing run. */
router.post('/chores/email/scan', c.scan);

/** Preview planned label mutations without committing them. */
router.post('/chores/email/dry-run', c.preview);

/**
 * Execute a batch of actions.
 * Rate-limited to 30 requests per minute per IP to protect Gmail API quotas.
 */
router.post(
  '/actions',
  rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
  c.execute,
);

/** Fetch a run summary report. */
router.get('/runs/:runId', c.report);

/** Undo all actions in a completed run. */
router.post('/runs/:runId/undo', c.undo);

/** Submit a score to the leaderboard. */
router.post('/scores', c.scores);

export default router;
