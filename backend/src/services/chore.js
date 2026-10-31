/**
 * @module chore
 * @description Core chore-management service: scans Gmail, plans label mutations,
 *   executes them idempotently, reports scores and supports full undo.
 */

import { ACTIONS, ACTION_KINDS, POINTS_PER_ACTION } from '../../../shared/actions.js';
import { randomUUID } from 'node:crypto';
import { all, one, write } from '../models/store.js';
import * as gmail from './gmail.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute the label set that remains after the given action kind removes its label.
 *
 * @param {string[]} labels - Current Gmail label IDs on the message.
 * @param {string}   kind   - Action kind (e.g. "archive", "delete", "keep").
 * @returns {string[]} Updated label array with the action's removal label stripped.
 */
export function labelsFor(labels, kind) {
  const removeLabel = ACTIONS.find((action) => action.kind === kind)?.removeLabel;
  return labels.filter((label) => label !== removeLabel);
}

/**
 * Assert that a run belongs to the current session and return it.
 *
 * @param {string} id      - Run UUID.
 * @param {object} session - Active session record.
 * @returns {object} The run row from the database.
 * @throws {Error} 404 if the run does not exist or belongs to a different session.
 */
export function assertRun(id, session) {
  const run = one('SELECT * FROM runs WHERE id=? AND session_id=?', id, session.id);
  if (!run) throw Object.assign(new Error('Run not found'), { status: 404 });
  return run;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

/**
 * Start a new processing run.
 * - For live sessions: refreshes messages from Gmail (once per minute).
 * - For demo sessions: uses pre-seeded messages.
 * Inserts a new `runs` row and returns all current inbox messages.
 *
 * @param {object} session - Active session record.
 * @returns {Promise<{runId: string, mode: string, messages: object[]}>}
 */
export async function scan(session) {
  // Refresh Gmail data at most once per minute to avoid excessive API calls.
  if (session.mode === 'live') {
    const existing = one(
      'SELECT created FROM runs WHERE session_id=? ORDER BY created DESC LIMIT 1',
      session.id,
    );
    const stale = !existing || Date.now() - existing.created > 60_000;
    if (stale) {
      const messages = await gmail.scan(session);
      for (const m of messages) {
        write(
          'INSERT OR REPLACE INTO messages VALUES(?,?,?,?,?,?)',
          m.id,
          session.id,
          m.subject,
          m.sender,
          m.snippet,
          JSON.stringify(m.labels),
        );
      }
    }
  }

  const id = randomUUID();
  write('INSERT INTO runs(id,session_id,created) VALUES(?,?,?)', id, session.id, Date.now());

  const messages = all(
    'SELECT id,subject,sender,snippet,labels FROM messages WHERE session_id=?',
    session.id,
  ).filter((m) => JSON.parse(m.labels).includes('INBOX'));

  return { runId: id, mode: session.mode, messages };
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

/**
 * Validate and enrich a list of requested actions without writing anything.
 * Throws if the run has already ended or if any referenced message is missing.
 *
 * @param {object}   session - Active session record.
 * @param {string}   runId   - UUID of the open run.
 * @param {object[]} actions - Array of `{id, messageId, kind}` objects.
 * @returns {object[]} Enriched action descriptors including `before` / `after` label arrays.
 */
export function plan(session, runId, actions) {
  const run = assertRun(runId, session);
  if (run.ended || run.undone) {
    throw Object.assign(new Error('Run has ended'), { status: 409 });
  }

  return actions.map((a) => {
    const m = one(
      'SELECT * FROM messages WHERE id=? AND session_id=?',
      a.messageId,
      session.id,
    );
    if (!m) throw Object.assign(new Error('Message not found'), { status: 404 });

    const before = JSON.parse(m.labels);
    return { ...a, before, after: labelsFor(before, a.kind), subject: m.subject };
  });
}

// ─── Execute ──────────────────────────────────────────────────────────────────

/**
 * Execute a batch of actions idempotently.
 * Inserts action rows in `pending` state, then groups by kind and calls Gmail
 * batchModify once per kind (for live sessions). Each action is marked `done`
 * after a successful API call.
 *
 * @param {object}   session - Active session record.
 * @param {string}   runId   - UUID of the open run.
 * @param {object[]} actions - Array of `{id, messageId, kind}` objects.
 * @returns {Promise<{results: object[], report: object}>}
 */
export async function execute(session, runId, actions) {
  const planned = plan(session, runId, actions);
  const results = [];

  // Idempotency check: reject conflicting reuse of an action ID.
  for (const a of planned) {
    const old = one('SELECT * FROM actions WHERE id=?', a.id);
    if (old) {
      if (old.run_id !== runId || old.message_id !== a.messageId || old.kind !== a.kind) {
        throw Object.assign(new Error('Idempotency key conflict'), { status: 409 });
      }
      if (old.status === 'done') {
        results.push({ id: a.id, status: 'done' });
        continue;
      }
    }

    // Prevent double-processing the same message within a single run.
    const previous = one(
      'SELECT id FROM actions WHERE run_id=? AND message_id=? AND status=?',
      runId,
      a.messageId,
      'done',
    );
    if (previous) {
      throw Object.assign(new Error('Message already processed in this run'), { status: 409 });
    }

    write(
      'INSERT OR IGNORE INTO actions VALUES(?,?,?,?,?,?,?)',
      a.id,
      runId,
      a.messageId,
      a.kind,
      JSON.stringify(a.before),
      JSON.stringify(a.after),
      'pending',
    );
  }

  // Group retries by deterministic label mutation; Gmail batchModify is idempotent.
  for (const kind of ACTION_KINDS) {
    const group = planned.filter(
      (a) => a.kind === kind && !results.some((r) => r.id === a.id),
    );

    if (session.mode === 'live' && kind !== 'keep') {
      const actionDef = ACTIONS.find((action) => action.kind === kind);
      await gmail.modify(session, group.map((a) => a.messageId), [], [actionDef.removeLabel]);
    }

    for (const a of group) {
      write(
        'UPDATE messages SET labels=? WHERE id=? AND session_id=?',
        JSON.stringify(a.after),
        a.messageId,
        session.id,
      );
      write('UPDATE actions SET status=? WHERE id=?', 'done', a.id);
      results.push({ id: a.id, status: 'done' });
    }
  }

  return { results, report: report(session, runId) };
}

// ─── Report ───────────────────────────────────────────────────────────────────

/**
 * Build a summary report for a completed or in-progress run.
 *
 * @param {object} session - Active session record.
 * @param {string} runId   - UUID of the run.
 * @returns {object} Report including processed count, changed count, score, and time saved.
 */
export function report(session, runId) {
  const run = assertRun(runId, session);
  const actions = all(
    'SELECT id,message_id,kind,before_labels,after_labels,status FROM actions WHERE run_id=?',
    runId,
  );

  const done = actions.filter((a) => a.status === 'done');
  const changed = done.filter((a) => a.before_labels !== a.after_labels).length;

  return {
    runId,
    mode: session.mode,
    processed: done.length,
    changed,
    score: done.length * POINTS_PER_ACTION,
    timeSavedSeconds: changed * 5,
    timeSavedIsEstimate: true,
    undone: !!run.undone,
    actions,
  };
}

// ─── Undo ─────────────────────────────────────────────────────────────────────

/**
 * Undo all actions in a run by reversing Gmail label mutations and restoring
 * local message state. Marks the run as undone.
 *
 * @param {object} session - Active session record.
 * @param {string} runId   - UUID of the run to undo.
 * @returns {Promise<object>} Final report reflecting the undone state.
 */
export async function undo(session, runId) {
  assertRun(runId, session);

  const actions = all(
    'SELECT * FROM actions WHERE run_id=? AND status=?',
    runId,
    'done',
  );

  for (const a of actions) {
    if (session.mode === 'live') {
      const before = JSON.parse(a.before_labels);
      const after = JSON.parse(a.after_labels);
      // Re-add labels that were removed, remove labels that were added.
      await gmail.modify(
        session,
        [a.message_id],
        before.filter((x) => !after.includes(x)),
        after.filter((x) => !before.includes(x)),
      );
    }
    write(
      'UPDATE messages SET labels=? WHERE id=? AND session_id=?',
      a.before_labels,
      a.message_id,
      session.id,
    );
    write('UPDATE actions SET status=? WHERE id=?', 'undone', a.id);
  }

  write('UPDATE runs SET undone=1,ended=? WHERE id=?', Date.now(), runId);
  write('DELETE FROM scores WHERE run_id=?', runId);

  return report(session, runId);
}
