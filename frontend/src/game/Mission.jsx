import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import Buddy, { reaction } from './Buddy';
import './arcade.css';
import GameField from './GameField';
import { getGame } from './catalog';
import MissionOverlay from './MissionOverlay';
import { POINTS_PER_ACTION } from '../../../shared/actions';
export default function Mission({ scan, onFinish, onError, gameId }) {
  const game = getGame(gameId);
  const [index, setIndex] = useState(0),
    [countdown, setCountdown] = useState(3),
    [seconds, setSeconds] = useState(120),
    [arcadeScore, setArcadeScore] = useState(0),
    [paused, setPaused] = useState(false),
    [pending, setPending] = useState([]),
    [processed, setProcessed] = useState(0),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(null);
  const [event, setEvent] = useState(() =>
      reaction(game.id === 'cricket' ? 'welcome' : game.id + 'Welcome'),
    ),
    [pose, setPose] = useState('idle');
  const lastAction = useRef(Date.now()),
    lastIdle = useRef(Date.now());
  const locked = useRef(false);
  const message = scan.messages[index];
  function react(kind, mail) {
    lastAction.current = Date.now();
    setEvent(reaction(kind, mail));
    setPose(kind === 'success' ? 'celebrate' : kind);
  }
  useEffect(() => {
    if (!countdown) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  useEffect(() => {
    if (paused || seconds === 0 || !message) return;
    const t = setInterval(() => {
      if (Date.now() - lastAction.current > 12000 && Date.now() - lastIdle.current > 15000) {
        lastIdle.current = Date.now();
        setEvent(reaction('idle'));
        setPose('idle');
      }
    }, 1000);
    return () => clearInterval(t);
  }, [paused, seconds === 0, !!message]);
  useEffect(() => {
    if (pose === 'idle') return;
    const t = setTimeout(() => setPose('idle'), 1800);
    return () => clearTimeout(t);
  }, [event]);
  useEffect(() => {
    if (paused || countdown || seconds === 0) return;
    const timer = setTimeout(() => setSeconds((x) => x - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, paused, countdown]);
  function choose(kind, runs = 0) {
    if (!message || paused || countdown || seconds === 0 || busy) return;
    setPending((p) => [...p, { id: crypto.randomUUID(), messageId: message.id, kind }]);
    setIndex((i) => i + 1);
    setArcadeScore((value) => value + runs);
    react(kind === 'archive' ? kind : game.id === 'cricket' && runs === 6 ? 'six' : kind, message);
  }
  useEffect(() => {
    function key(e) {
      if (e.target.tagName === 'INPUT' || e.repeat) return;
      if (e.key === 'Escape' && !preview && !busy && !countdown) {
        e.preventDefault();
        setPaused((value) => !value);
        return;
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  async function showPreview() {
    react('preview');
    setPaused(true);
    setBusy(true);
    try {
      if (pending.length) {
        const p = await api('/chores/email/dry-run', { runId: scan.runId, actions: pending });
        setPreview(p.actions);
      } else await finish();
    } catch (e) {
      react('error');
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      await api('/actions', { runId: scan.runId, actions: pending });
      setProcessed((n) => n + pending.length);
      setPending([]);
      setPreview(null);
      react('success');
      if (seconds === 0 || !message) await finish();
      else setPaused(false);
    } catch (e) {
      react('error');
      onError(e.message);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function finish() {
    const report = await api('/runs/' + scan.runId);
    onFinish({ ...report, arcadeScore, arcadeGameId: game.id });
  }
  return (
    <section className={`mission arcade-mission ${seconds <= 15 ? 'timer-urgent' : ''}`}>
      <MissionOverlay
        countdown={countdown}
        game={game}
        paused={paused && !preview && !busy}
        onResume={() => setPaused(false)}
      />
      <div className="mission-top">
        <span className="eyebrow">{game.title.toUpperCase()} / NIGHT SHIFT</span>
        <span className="mode">{scan.mode === 'demo' ? 'DEMO · MOCK EMAILS' : 'LIVE · GMAIL'}</span>
      </div>
      <div className="stats">
        <div>
          <small>TIME LEFT</small>
          <strong>
            {seconds}
            <em>s</em>
          </strong>
        </div>
        <div>
          <small>{game.scoreLabel}</small>
          <strong>{arcadeScore}</strong>
        </div>
        <div>
          <small>CONFIRMED SCORE</small>
          <strong>{processed * POINTS_PER_ACTION}</strong>
        </div>
        <div>
          <small>QUEUED DECISIONS</small>
          <strong>{pending.length}</strong>
        </div>
        <Button
          variant="outline"
          disabled={!!preview || busy || !!countdown}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <div className="progress">
        <i style={{ width: `${(seconds / 120) * 100}%` }} />
      </div>
      <div className="arcade-world">
        <div className="world-heading">
          <b>MILO / THE COMMENTARY BOX</b>
          <span>GOOD SHOTS. QUESTIONABLE JOKES.</span>
        </div>
        <Buddy event={event} pose={pose} onTap={() => react('tap')} />
        {pose === 'celebrate' && (
          <div key={event.id} className="world-particles" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ '--n': i }}>
                ✦
              </span>
            ))}
          </div>
        )}
        <span className="decision-streak">
          {index === 0 ? 'Milo is ready. Are you?' : index + ' decisions · teamwork in progress ✦'}
        </span>
      </div>
      <div className="mission-board">
        {preview ? (
          <div className="email-card">
            <span className="eyebrow">DRY RUN · NO CHANGES APPLIED YET</span>
            <h2>Ready to clear some space?</h2>
            <p>Review your decisions before the backend applies them.</p>
            <ul className="preview-list">
              {preview.map((a) => (
                <li key={a.id}>
                  <span>{a.subject}</span>
                  <b>{a.kind}</b>
                </li>
              ))}
            </ul>
            <Button disabled={busy} onClick={apply}>
              {busy ? 'Applying…' : 'Confirm & apply ' + preview.length + ' decisions'}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPreview(null);
                setPaused(false);
              }}
            >
              Back to game
            </Button>
          </div>
        ) : (
          <>
            {(seconds === 0 || !message) && (
              <div className="innings-summary">
                {game.icon} ROUND OVER
                <span>Review your successful shots to finish. Unplayed emails stay unchanged.</span>
              </div>
            )}
            <GameField
              gameId={game.id}
              message={message}
              remaining={scan.messages.length - index}
              disabled={paused || !!countdown || seconds === 0 || busy}
              onDecision={choose}
              onFeedback={(kind) => react(kind)}
            />
            <div className="checkpoint">
              <p>Your choices are queued. Nothing changes until you review and confirm.</p>
              <Button disabled={busy} onClick={showPreview}>
                {busy ? 'Loading…' : pending.length ? 'Review & apply decisions' : 'Finish mission'}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
