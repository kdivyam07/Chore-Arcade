import { ACTION_KINDS } from '../../../shared/actions.js';
import { cookieValue } from '../utils/cookies.js';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import * as chore from '../services/chore.js';
import { createSession, setCookie } from '../services/session.js';
import { oauth } from '../services/gmail.js';
import { all, write } from '../models/store.js';

/** Zod schema for batch action submission. */
const batch = z
  .object({
    runId: z.string().uuid(),
    actions: z
      .array(
        z.object({
          id: z.string().uuid(),
          messageId: z.string().min(1).max(100),
          kind: z.enum(ACTION_KINDS),
        }),
      )
      .min(1)
      .max(30),
  })
  .superRefine((b, c) => {
    const ids = b.actions.map((a) => a.id);
    const msgIds = b.actions.map((a) => a.messageId);
    if (new Set(ids).size !== ids.length || new Set(msgIds).size !== msgIds.length) {
      c.addIssue({ code: 'custom', message: 'Duplicate actions' });
    }
  });

/** In-memory OAuth state store (expires after 10 minutes). */
const states = new Map();

/** GET /api/health — public liveness probe. */
export const health = (_q, r) => r.json({ status: 'ok' });

/** POST /api/auth/demo — create an isolated mock session. */
export const demo = (_q, r) => {
  setCookie(r, createSession());
  r.json({ mode: 'demo' });
};

/** GET /api/auth/me — return session mode and OAuth availability. */
export const me = (q, r) =>
  r.json({ mode: q.session?.mode || null, googleConfigured: !!process.env.GOOGLE_CLIENT_ID });

/** GET /api/chores — list available chore adapters. */
export const chores = (_q, r) => r.json([{ id: 'email', name: 'Inbox mission' }]);

/** POST /api/chores/email/scan — load inbox messages for this session. */
export const scan = async (q, r) => r.json(await chore.scan(q.session));

/** POST /api/chores/email/dry-run — preview label changes without applying them. */
export const preview = (q, r) => {
  const b = batch.parse(q.body);
  r.json({ dryRun: true, actions: chore.plan(q.session, b.runId, b.actions) });
};

/** POST /api/actions — execute a reviewed batch of email decisions. */
export const execute = async (q, r) => {
  const b = batch.parse(q.body);
  r.json(await chore.execute(q.session, b.runId, b.actions));
};

/** GET /api/runs/:runId — fetch confirmed report for a run. */
export const report = (q, r) => r.json(chore.report(q.session, q.params.runId));

/** POST /api/runs/:runId/undo — reverse only the label changes made by a run. */
export const undo = async (q, r) => r.json(await chore.undo(q.session, q.params.runId));

/** POST /api/scores — record backend-computed score; reject fabricated totals. */
export const scores = (q, r) => {
  const b = z
    .object({ runId: z.string().uuid(), name: z.string().trim().min(1).max(24) })
    .parse(q.body);
  const result = chore.report(q.session, b.runId);
  if (result.undone) {
    throw Object.assign(new Error('Undone runs cannot be scored'), { status: 409 });
  }
  write('INSERT OR REPLACE INTO scores VALUES(?,?,?,?)', b.runId, b.name, result.score, Date.now());
  write('UPDATE runs SET ended=? WHERE id=?', Date.now(), b.runId);
  r.json({ score: result.score });
};

/** GET /api/leaderboard — top 10 scores by confirmed chore points. */
export const leaderboard = (_q, r) =>
  r.json(
    all(
      'SELECT s.name,s.score,se.mode FROM scores s JOIN runs r ON r.id=s.run_id JOIN sessions se ON se.id=r.session_id ORDER BY s.score DESC,s.created ASC LIMIT 10',
    ),
  );

/** GET /api/auth/google — initiate OAuth 2.0 authorization-code flow. */
export const google = (_q, r) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return r
      .status(503)
      .json({ error: { code: 'GOOGLE_NOT_CONFIGURED', message: 'Google credentials are not configured. Use demo mode.' } });
  }
  const state = randomBytes(32).toString('hex');
  states.set(state, Date.now());
  // Prune expired states
  for (const [s, t] of states) {
    if (Date.now() - t > 600_000) states.delete(s);
  }
  r.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600_000,
  });
  r.redirect(
    oauth().generateAuthUrl({
      scope: ['https://www.googleapis.com/auth/gmail.modify'],
      state,
      access_type: 'online',
    }),
  );
};

/** GET /api/auth/callback — exchange authorization code for session token. */
export const callback = async (q, r) => {
  const cookie = cookieValue(q, 'oauth_state');
  const state = q.query.state;
  if (!state || cookie !== state || !states.has(state) || Date.now() - states.get(state) > 600_000) {
    throw Object.assign(new Error('Invalid OAuth state'), { status: 400 });
  }
  states.delete(state);
  const { tokens } = await oauth().getToken(z.string().parse(q.query.code));
  setCookie(r, createSession('live', tokens));
  r.clearCookie('oauth_state');
  r.redirect('/');
};
