import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './services/api';
import { Button } from './components/Button';
import Mission from './game/Mission';
import './styles/theme.css';
import './styles/app.css';
import './styles/mission.css';
import './styles/report.css';
import InteractiveExperience from './components/InteractiveExperience';
import GameMenu from './components/GameMenu';
import { getGame } from './game/catalog';
function App() {
  const [page, setPage] = useState('home'),
    [selectedGame, setSelectedGame] = useState('cricket'),
    [scan, setScan] = useState(null),
    [report, setReport] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [leaders, setLeaders] = useState([]),
    [name, setName] = useState('Player'),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    async function refresh() {
      try {
        setLeaders(await api('/leaderboard'));
      } catch {
        /* Keep previous leaderboard on network failure. */
      }
    }
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);
  async function start(demo) {
    setBusy(true);
    setError('');
    try {
      if (demo) await api('/auth/demo', {});
      const result = await api('/chores/email/scan', {});
      setScan(result);
      setSaved(false);
      setPage('game');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function undo() {
    setBusy(true);
    try {
      setReport(await api('/runs/' + report.runId + '/undo', {}));
      setSaved(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      await api('/scores', { runId: report.runId, name });
      setSaved(true);
      setLeaders(await api('/leaderboard'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <InteractiveExperience />
      <header role="banner">
        <a className="logo" href="/" aria-label="Chore Arcade home">
          <span className="logo-mark">✳</span> chore<span>arcade</span>
          <sup>BETA</sup>
        </a>
        <nav aria-label="Main navigation">
          <button
            aria-current={page === 'home' ? 'page' : undefined}
            onClick={() => setPage('home')}
          >
            MAIN MENU
          </button>
          <button
            aria-current={page === 'leaderboard' ? 'page' : undefined}
            onClick={() => setPage('leaderboard')}
          >
            HIGH SCORES
          </button>
          <a href="/api/auth/google">
            Connect Gmail <span>↗</span>
          </a>
        </nav>
      </header>
      <main id="main-content">
        {error && (
          <div role="alert" className="error">
            {error}
            <button aria-label="Dismiss error" onClick={() => setError('')}>
              ×
            </button>
          </div>
        )}
        {page === 'home' && (
          <GameMenu
            busy={busy}
            onStart={start}
            onLeaderboard={() => setPage('leaderboard')}
            selectedGame={selectedGame}
            onSelectGame={setSelectedGame}
          />
        )}
        {page === 'game' && (
          <Mission
            key={scan.runId}
            scan={scan}
            gameId={selectedGame}
            onError={setError}
            onFinish={(r) => {
              setReport(r);
              setPage('report');
            }}
          />
        )}
        {page === 'report' && (
          <section className="report">
            <span className="eyebrow">MISSION REPORT / {report.mode.toUpperCase()}</span>
            <h1>{report.undone ? 'Changes undone.' : 'A little less chaos.'}</h1>
            <p>
              {report.mode === 'demo'
                ? 'These results describe your mock inbox. Your real Gmail was not changed.'
                : 'These results reflect confirmed Gmail operations.'}
            </p>
            {report.arcadeScore !== undefined && (
              <div className="innings-summary">
                {getGame(report.arcadeGameId).icon}{' '}
                {getGame(report.arcadeGameId).title.toUpperCase()}:{' '}
                <strong>
                  {report.arcadeScore} {getGame(report.arcadeGameId).unit}
                </strong>
                <span>Game points are separate from backend-confirmed chore points below.</span>
              </div>
            )}
            <div className="stats">
              <div>
                <small>PROCESSED</small>
                <strong>{report.processed}</strong>
              </div>
              <div>
                <small>CHANGED</small>
                <strong>{report.changed}</strong>
              </div>
              <div>
                <small>SCORE</small>
                <strong>{report.score}</strong>
              </div>
              <div>
                <small>EST. TIME SAVED</small>
                <strong>{report.timeSavedSeconds}s</strong>
              </div>
            </div>
            <p className="fine">
              Estimate assumes 5 seconds per changed item; it is not measured time savings.
            </p>
            <div className="report-actions">
              <Button disabled={busy || report.undone} variant="outline" onClick={undo}>
                Undo this mission
              </Button>
              <Button onClick={() => setPage('home')}>Back to mission control ↗</Button>
            </div>
            <div className="score-form">
              <label htmlFor="name">Leaderboard name</label>
              <input
                id="name"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
              />
              <Button disabled={busy || saved || report.undone || !name.trim()} onClick={save}>
                {saved ? 'Score saved ✓' : 'Save confirmed score'}
              </Button>
            </div>
            <details>
              <summary>View operation history</summary>
              {report.actions.map((a) => (
                <p key={a.id}>
                  Message {a.message_id} · {a.kind} · {a.status}
                </p>
              ))}
            </details>
          </section>
        )}
        {page === 'leaderboard' && (
          <section className="report">
            <span className="eyebrow">THE HALL OF SMALL WINS</span>
            <h1>
              Less mess.
              <br />
              More legends.
            </h1>
            <p>Top 10 missions · refreshes every 15 seconds · 100 points per confirmed decision</p>
            <ol className="leaders">
              {leaders.map((l, i) => (
                <li key={i}>
                  <span>#{i + 1}</span>
                  <b>{l.name}</b>
                  <small>{l.mode}</small>
                  <strong>{l.score}</strong>
                </li>
              ))}
            </ol>
            {!leaders.length && <p>No scores yet. Your mission could be the first.</p>}
            <Button onClick={() => setPage('home')}>Start a mission ↗</Button>
          </section>
        )}
      </main>
      <footer role="contentinfo">
        <span>BUILT FOR PROMPTWARS × OUTLIER 2026</span>
        <span>SYSTEM ONLINE · CHORE ARCADE v0.1</span>
      </footer>
    </>
  );
}
createRoot(document.getElementById('root')).render(<App />);
