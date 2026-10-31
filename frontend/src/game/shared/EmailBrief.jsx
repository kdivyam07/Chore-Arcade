export default function EmailBrief({ message, remaining, children }) {
  return (
    <aside className="email-brief">
      <span className="eyebrow">YOUR NEXT EMAIL</span>
      <span className="brief-icon">✉</span>
      <h2>{message?.subject || 'ROUND COMPLETE!'}</h2>
      <strong>{message?.sender}</strong>
      <p>{message?.snippet || 'Review your successful decisions to apply the changes.'}</p>
      <span className="mail-remaining">{remaining} EMAILS LEFT</span>
      <p className="email-note">
        Select the email action before playing. Misses change nothing. Mark read changes unread
        status; this is an email preview.
      </p>
      {children}
    </aside>
  );
}
