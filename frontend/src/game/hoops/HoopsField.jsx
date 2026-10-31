import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import EmailBrief from '../shared/EmailBrief';
import ActionTargets from '../shared/ActionTargets';
import useGameLoop from '../shared/useGameLoop';
import {
  HOOPS,
  BALL_START,
  recommendedVelocity,
  basketPosition,
  crossedHoop,
} from '../shared/math';
import '../shared/other-games.css';

export default function HoopsField({ message, remaining, disabled, onDecision, onFeedback }) {
  const [target, setTarget] = useState('archive'),
    [phase, setPhase] = useState('ready'),
    [pull, setPull] = useState(null),
    [result, setResult] = useState('');
  const ball = useRef(null),
    clock = useRef(0),
    shot = useRef(null),
    lastPoint = useRef(BALL_START),
    drag = useRef(null);
  useEffect(() => {
    clock.current = 0;
    setPhase('ready');
    setResult('');
    setPull(null);
    ball.current?.setAttribute('transform', 'translate(450 420)');
  }, [message?.id]);
  useGameLoop(!disabled && phase === 'flight', (dt) => {
    clock.current += dt;
    const p = basketPosition(shot.current.velocity, clock.current / 1000);
    ball.current?.setAttribute(
      'transform',
      `translate(${p.x} ${p.y}) rotate(${clock.current / 4})`,
    );
    if (crossedHoop(lastPoint.current, p, HOOPS[shot.current.kind])) {
      setPhase('done');
      setResult('SWISH! +100');
      onDecision(shot.current.kind, 100);
      return false;
    }
    lastPoint.current = p;
    if (p.y > 510 || p.x < -70 || p.x > 970 || clock.current > 4000) {
      setPhase('miss');
      setResult('OFF THE RIM! YOUR EMAIL IS UNCHANGED.');
      onFeedback('hoopsMiss');
      return false;
    }
  });
  function launch(velocity) {
    if (disabled || !message || !['ready', 'miss'].includes(phase)) return;
    shot.current = { kind: target, velocity };
    clock.current = 0;
    lastPoint.current = BALL_START;
    setResult('SHOT IN THE AIR…');
    setPull(null);
    setPhase('flight');
    onFeedback('hoopsLaunch');
  }
  function guidedShot() {
    launch(recommendedVelocity(HOOPS[target]));
  }
  useEffect(() => {
    function key(e) {
      if (disabled || e.repeat || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName))
        return;
      if (['1', '2', '3'].includes(e.key) && phase !== 'flight') {
        e.preventDefault();
        setTarget(['archive', 'read', 'keep'][Number(e.key) - 1]);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        guidedShot();
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  function point(e) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 900, y: ((e.clientY - r.top) / r.height) * 500 };
  }
  function down(e) {
    if (disabled || !message || !['ready', 'miss'].includes(phase)) return;
    const p = point(e);
    if (Math.hypot(p.x - 450, p.y - 420) > 70) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = e.pointerId;
    setPull(p);
  }
  function move(e) {
    if (drag.current !== e.pointerId || disabled) return;
    setPull(point(e));
  }
  function up(e) {
    if (drag.current !== e.pointerId) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (disabled) {
      setPull(null);
      return;
    }
    const p = point(e),
      dx = Math.max(-220, Math.min(220, 450 - p.x)),
      dy = Math.max(25, Math.min(220, p.y - 420));
    launch({ x: dx * 3.2, y: -dy * 3.2 });
  }
  const locked = disabled || phase === 'flight' || phase === 'done';
  return (
    <div className="play-layout" data-game="hoops" data-phase={phase}>
      <EmailBrief message={message} remaining={remaining}>
        <p className="arena-hint">
          Pull down from the ball and release. For a timing-free alternative, the guided-shot button
          aims at your selected hoop.
        </p>
      </EmailBrief>
      <div className="hoops-arena">
        <div className="arena-top">
          <span>HOOP HUSTLE / MIDNIGHT COURT</span>
          <b>{remaining} BALLS LEFT</b>
        </div>
        <ActionTargets selected={target} disabled={locked} onSelect={setTarget} />
        <svg
          viewBox="0 0 900 500"
          className="interactive-arena"
          role="img"
          aria-label="Basketball court. Pull back from the email-ball at the bottom and release to shoot into the selected hoop."
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => {
            drag.current = null;
            setPull(null);
          }}
        >
          <defs>
            <linearGradient id="court" x2="0" y2="1">
              <stop stopColor="#171e35" />
              <stop offset="1" stopColor="#4c3232" />
            </linearGradient>
          </defs>
          <rect width="900" height="500" fill="url(#court)" />
          <path
            d="M0 300H900M0 370H900M0 450H900M100 300L0 500M300 300L250 500M600 300L650 500M800 300L900 500"
            stroke="#ffc17718"
            strokeWidth="2"
          />
          <ellipse
            cx="450"
            cy="440"
            rx="170"
            ry="40"
            fill="none"
            stroke="#ffc17755"
            strokeWidth="3"
          />
          {Object.entries(HOOPS).map(([kind, p]) => (
            <g key={kind} opacity={kind === target ? 1 : 0.45}>
              <path d={`M${p.x} ${p.y - 65}V300`} stroke="#74859a" strokeWidth="9" />
              <rect
                x={p.x - 65}
                y={p.y - 65}
                width="130"
                height="75"
                rx="5"
                fill="#c8e6ed22"
                stroke={kind === target ? '#ffc177' : '#b1c6d9'}
                strokeWidth="4"
              />
              <rect
                x={p.x - 25}
                y={p.y - 40}
                width="50"
                height="37"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              />
              <path
                d={`M${p.x - 39} ${p.y}L${p.x - 24} ${p.y + 55}H${p.x + 24}L${p.x + 39} ${p.y}M${p.x - 29} ${p.y + 28}H${p.x + 29}M${p.x - 14} ${p.y}V${p.y + 55}M${p.x + 14} ${p.y}V${p.y + 55}`}
                stroke="#e6d8bb"
                fill="none"
                strokeWidth="2"
              />
              <ellipse
                cx={p.x}
                cy={p.y}
                rx="42"
                ry="8"
                fill="none"
                stroke="#ff995c"
                strokeWidth="7"
              />
              <text
                x={p.x}
                y={p.y - 88}
                textAnchor="middle"
                fill="#fff0cf"
                fontSize="17"
                fontWeight="900"
              >
                {kind.toUpperCase()}
              </text>
            </g>
          ))}
          {pull && <line x1="450" y1="420" x2={pull.x} y2={pull.y} className="pull-guide" />}
          <g ref={ball} className="hoops-ball" transform="translate(450 420)">
            <circle r="24" fill="#e89548" stroke="#ffcb87" strokeWidth="3" />
            <path
              d="M-24 0h48M0-24v48M-17-17Q5 0-17 17M17-17Q-5 0 17 17"
              fill="none"
              stroke="#704328"
              strokeWidth="2"
            />
            <rect x="15" y="-29" width="24" height="17" rx="3" fill="#f8f4de" />
            <path d="M16-26L27-18 37-26" fill="none" stroke="#735b44" strokeWidth="2" />
          </g>
          <text x="450" y="488" textAnchor="middle" fill="#e0c7aa" fontSize="13">
            PULL DOWN FROM THE BALL · RELEASE TO SHOOT
          </text>
        </svg>
        <div
          className="arena-status"
          role="status"
          data-outcome={phase === 'miss' ? 'miss' : phase === 'done' ? 'hit' : ''}
        >
          {result || 'PICK A HOOP. FIND YOUR ARC.'}
        </div>
        <div className="arena-controls">
          <Button disabled={locked || !message} onClick={guidedShot}>
            🏀 GUIDED SHOT
          </Button>
          <p className="arena-hint">
            Selected action: {target.toUpperCase()}. Only a basket in the chosen hoop queues the
            action. Misses retry the same email.
          </p>
        </div>
      </div>
    </div>
  );
}
