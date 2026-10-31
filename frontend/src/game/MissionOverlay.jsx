import { Button } from '../components/Button';
import './mission-overlay.css';

export default function MissionOverlay({ countdown, paused, onResume, game }) {
  if (!countdown && !paused) return null;
  return (
    <div className="mission-overlay">
      <div className="pause-panel">
        <span className="eyebrow">{countdown ? 'GET READY, CAPTAIN' : 'MISSION ON HOLD'}</span>
        {countdown ? (
          <>
            <strong className="countdown-number" key={countdown} role="status">
              {countdown}
            </strong>
            <h2>{game?.title || 'READY TO PLAY?'}</h2>
            <p>{game?.instructions} Your 120 seconds start after the countdown.</p>
          </>
        ) : (
          <>
            <span className="pause-icon" aria-hidden="true">
              Ⅱ
            </span>
            <h2>TAKE A BREATHER.</h2>
            <p>Your timer is paused. Your queued decisions are waiting for you.</p>
            <Button onClick={onResume}>▶ RESUME MISSION</Button>
            <small>ESC TO RESUME</small>
          </>
        )}
      </div>
    </div>
  );
}
