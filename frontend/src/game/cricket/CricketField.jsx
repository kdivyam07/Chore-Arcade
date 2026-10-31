import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { KEY_ACTIONS } from '../../../../shared/actions';
import CricketPitch from './CricketPitch';
import {
  DELIVERY_MS,
  SHOT_MS,
  TARGETS,
  judgeTiming,
  deliveryPosition,
  shotPosition,
} from './physics';
import './cricket.css';
import EmailBrief from '../shared/EmailBrief';
import ActionTargets from '../shared/ActionTargets';

export default function CricketField({ message, disabled, onDecision, onFeedback, remaining }) {
  const [phase, setPhase] = useState('ready'),
    [target, setTarget] = useState('archive'),
    [result, setResult] = useState(null),
    [assisted, setAssisted] = useState(false);
  const ball = useRef(null),
    meter = useRef(null),
    field = useRef(null),
    clock = useRef(0),
    shot = useRef(null),
    callbacks = useRef({ onDecision, onFeedback });
  callbacks.current = { onDecision, onFeedback };
  useEffect(() => {
    clock.current = 0;
    if (meter.current) meter.current.style.left = '0%';
    shot.current = null;
    setPhase('ready');
    setResult(null);
    ball.current?.setAttribute('transform', 'translate(450 145)');
  }, [message?.id]);
  useEffect(() => {
    if (disabled || !['flight', 'hit'].includes(phase)) return;
    let frame, last;
    function tick(now) {
      if (last !== undefined) clock.current += Math.min(now - last, 50);
      last = now;
      if (phase === 'flight') {
        const progress = clock.current / DELIVERY_MS;
        const point = deliveryPosition(progress);
        ball.current?.setAttribute('transform', `translate(${point.x} ${point.y})`);
        if (meter.current) meter.current.style.left = `${Math.min(progress / 1.3, 1) * 100}%`;
        if (progress >= 1.3) {
          setResult({ runs: 0, label: 'BOWLED! TRY AGAIN' });
          setPhase('miss');
          callbacks.current.onFeedback('miss');
          return;
        }
      } else {
        const progress = Math.min(clock.current / SHOT_MS, 1),
          point = shotPosition(shot.current.start, TARGETS[shot.current.kind], progress);
        ball.current?.setAttribute(
          'transform',
          `translate(${point.x} ${point.y}) scale(${1 - progress * 0.3})`,
        );
        if (progress === 1) {
          const completed = shot.current;
          setPhase('ready');
          callbacks.current.onDecision(completed.kind, completed.runs);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, disabled]);
  function bowl() {
    if (disabled || !message || !['ready', 'miss'].includes(phase)) return;
    clock.current = 0;
    if (meter.current) meter.current.style.left = '0%';
    shot.current = { kind: target };
    setResult(null);
    setPhase('flight');
    callbacks.current.onFeedback('bowl');
  }
  function swing() {
    if (disabled || phase !== 'flight') return;
    const progress = clock.current / DELIVERY_MS,
      judgement = assisted ? { runs: 4, label: 'FOUR! ASSISTED SHOT' } : judgeTiming(progress);
    setResult(judgement);
    if (!judgement.runs) {
      setPhase('miss');
      callbacks.current.onFeedback('miss');
      return;
    }
    shot.current = { ...shot.current, runs: judgement.runs, start: deliveryPosition(progress) };
    clock.current = 0;
    setPhase('hit');
  }
  function action() {
    if (phase === 'flight') swing();
    else bowl();
  }
  useEffect(() => {
    function key(e) {
      if (e.repeat || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const kind = KEY_ACTIONS[e.key] || { 1: 'archive', 2: 'read', 3: 'keep' }[e.key];
      if (kind && ['ready', 'miss'].includes(phase) && !disabled) {
        e.preventDefault();
        setTarget(kind);
      }
      if (e.code === 'Space' && !disabled) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  const activeTarget = ['flight', 'hit'].includes(phase) ? shot.current?.kind || target : target;
  const locked = disabled || !['ready', 'miss'].includes(phase);
  return (
    <div className="play-layout" ref={field} data-phase={phase}>
      <EmailBrief message={message} remaining={remaining}>
        <label className="assisted-option">
          <input
            type="checkbox"
            checked={assisted}
            disabled={locked}
            onChange={(e) => setAssisted(e.target.checked)}
          />{' '}
          Relaxed mode · no timing required
        </label>
      </EmailBrief>
      <div className="cricket-ground">
        <div className="arena-top">
          <span>THE NIGHT SHIFT / INBOX PREMIER LEAGUE</span>
          <b>
            {phase === 'flight'
              ? 'BALL INCOMING'
              : phase === 'hit'
                ? 'SHOT AWAY!'
                : phase === 'miss'
                  ? 'NO EMAIL CHANGED'
                  : 'CHOOSE YOUR SHOT'}
          </b>
        </div>
        <ActionTargets
          selected={activeTarget}
          disabled={locked}
          onSelect={(kind) => {
            setTarget(kind);
            shot.current = null;
          }}
        />
        <div className="pitch-wrapper">
          <CricketPitch
            phase={phase}
            ref={ball}
            onSwing={action}
            onAim={(e) => {
              if (!field.current) return;
              const r = e.currentTarget.getBoundingClientRect();
              field.current.style.setProperty(
                '--bat-aim',
                `${Math.max(-12, Math.min(12, ((e.clientX - r.left) / r.width) * 24 - 12))}deg`,
              );
            }}
          />
          {result && (
            <div
              key={`${phase}-${result.label}`}
              className={`shot-result ${result.runs ? 'shot-success' : 'shot-miss'}`}
              role="status"
            >
              <b>{result.label}</b>
              <span>
                {result.runs
                  ? `${activeTarget.toUpperCase()} TARGET · QUEUED AFTER LANDING`
                  : 'Same email. New delivery. Have another go!'}
              </span>
            </div>
          )}
        </div>
        <div className="timing-row">
          <span>EARLY</span>
          <div className="timing-track">
            <i className="timing-window" />
            <i className="timing-needle" ref={meter} />
          </div>
          <span>LATE</span>
        </div>
        <div className="arena-controls">
          <Button disabled={disabled || !message || phase === 'hit'} onClick={action}>
            {phase === 'hit'
              ? 'SHOT IN FLIGHT…'
              : phase === 'flight'
                ? '🏏 SWING NOW'
                : phase === 'miss'
                  ? '↻ RETRY DELIVERY'
                  : '▶ BOWL THIS EMAIL'}
          </Button>
          <p>
            {phase === 'flight'
              ? 'Swing as the ball reaches the green crease. Click the pitch or press SPACE.'
              : `Aiming: ${target.toUpperCase()}. Choose 1 / 2 / 3, then bowl. SPACE also bowls and swings.`}
          </p>
        </div>
      </div>
    </div>
  );
}
