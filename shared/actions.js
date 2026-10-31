// One definition for API validation, label changes, keyboard controls, and scoring zones.
export const POINTS_PER_ACTION = 100;
export const ACTIONS = [
  { kind: 'archive', label: '← Archive', description: 'Remove from inbox', key: 'ArrowLeft', removeLabel: 'INBOX' },
  { kind: 'read', label: '↓ Mark read', description: 'Clear unread status', key: 'ArrowDown', removeLabel: 'UNREAD' },
  { kind: 'keep', label: 'Keep →', description: 'Leave unchanged', key: 'ArrowRight', removeLabel: null },
];
export const ACTION_KINDS = ACTIONS.map(action => action.kind);
export const KEY_ACTIONS = Object.fromEntries(ACTIONS.map(action => [action.key, action.kind]));
