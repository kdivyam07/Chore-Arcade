/**
 * @module gmail
 * @description Thin wrapper around the Gmail REST API.
 * Exposes helpers to build an authenticated OAuth2 client, list inbox messages,
 * and apply batch label mutations.
 */

import { google } from 'googleapis';
import { unseal } from './session.js';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Create a fresh OAuth2 client using environment credentials.
 * The client has no tokens set — use {@link client} to attach a session token.
 *
 * @returns {import('googleapis').Auth.OAuth2Client}
 */
export function oauth() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

/**
 * Build an authenticated Gmail API client for a live session.
 *
 * @param {object} session - Live session row with an encrypted `token` field.
 * @returns {import('googleapis').gmail_v1.Gmail} Authenticated Gmail client.
 */
export function client(session) {
  const auth = oauth();
  auth.setCredentials(unseal(session.token));
  return google.gmail({ version: 'v1', auth });
}

// ─── Gmail operations ─────────────────────────────────────────────────────────

/**
 * Fetch up to 30 recent inbox messages with subject, sender and snippet metadata.
 *
 * @param {object} session - Live session row.
 * @returns {Promise<Array<{
 *   id: string,
 *   subject: string,
 *   sender: string,
 *   snippet: string,
 *   labels: string[]
 * }>>} Flattened message descriptors.
 */
export async function scan(session) {
  const gmailClient = client(session);

  const { data } = await gmailClient.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    maxResults: 30,
  });

  const result = [];

  for (const m of data.messages || []) {
    const { data: d } = await gmailClient.users.messages.get({
      userId: 'me',
      id: m.id,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From'],
    });

    result.push({
      id: m.id,
      subject: d.payload.headers.find((h) => h.name === 'Subject')?.value || '(no subject)',
      sender: d.payload.headers.find((h) => h.name === 'From')?.value || 'Unknown',
      snippet: d.snippet || '',
      labels: d.labelIds || [],
    });
  }

  return result;
}

/**
 * Apply a batch label modification to one or more messages.
 * This is a no-op when `ids` is empty to avoid unnecessary API calls.
 *
 * @param {object}   session        - Live session row.
 * @param {string[]} ids            - Gmail message IDs to modify.
 * @param {string[]} addLabelIds    - Label IDs to add.
 * @param {string[]} removeLabelIds - Label IDs to remove.
 * @returns {Promise<void>}
 */
export async function modify(session, ids, addLabelIds, removeLabelIds) {
  if (!ids.length) return;

  await client(session).users.messages.batchModify({
    userId: 'me',
    requestBody: { ids, addLabelIds, removeLabelIds },
  });
}
