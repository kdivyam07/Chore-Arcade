import { Button } from './Button';
import HeroPlayground from './HeroPlayground';
import GameArtwork from './GameArtwork';
import { GAMES, getGame } from '../game/catalog';
import './arcade-lobby.css';
export default function GameMenu({ busy, onStart, onLeaderboard, selectedGame, onSelectGame }) {
  const game = getGame(selectedGame);
  function browse(event) {
    if (busy || !event.target.closest('.cartridge-row')) return;
    const index = GAMES.findIndex((g) => g.id === game.id);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const nextIndex =
        (index + (event.key === 'ArrowRight' ? 1 : -1) + GAMES.length) % GAMES.length;
      onSelectGame(GAMES[nextIndex].id);
      event.currentTarget.querySelectorAll('.game-cartridge')[nextIndex]?.focus();
    }
  }
  return (
    <section
      className="arcade-lobby"
      aria-label="Game main menu"
      onKeyDown={browse}
      style={{ '--game-accent': game.color }}
    >
      <div className="lobby-heading">
        <div>
          <span className="sector-label">3 MACHINES / ONE CLEARER INBOX</span>
          <h1>
            CHOOSE YOUR <span>PLAY.</span>
          </h1>
        </div>
        <p>
          Different worlds. Real progress.
          <br />
          Pick a machine. Milo’s coming with you.
        </p>
      </div>
      <div className="cartridge-row" role="group" aria-label="Select a game">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            className="game-cartridge"
            aria-label={`Select ${g.title}`}
            aria-pressed={game.id === g.id}
            disabled={busy}
            onClick={() => onSelectGame(g.id)}
            style={{ '--card-accent': g.color }}
          >
            <div className="cartridge-id">
              <span>
                0{i + 1} / {g.tag}
              </span>
              <b>{game.id === g.id ? '● SELECTED' : '○ SELECT'}</b>
            </div>
            <GameArtwork id={g.id} />
            <div className="cartridge-title">
              <span>{g.icon}</span>
              <h2>{g.title}</h2>
              <span>↗</span>
            </div>
          </button>
        ))}
      </div>
      <div className="lobby-launch">
        <div className="selected-game">
          <span className="sector-label">NOW SELECTED / {game.short}</span>
          <h2 key={game.id}>
            {game.icon} {game.title}
          </h2>
          <p>{game.description}</p>
          <div className="game-facts">
            <span>120s ROUND</span>
            <span>12 DEMO EMAILS</span>
            <span>KEYBOARD + POINTER</span>
          </div>
          <div className="launch-actions">
            <Button disabled={busy} onClick={() => onStart(true)} aria-label="Play the demo">
              ▶ {busy ? 'LOADING…' : `PLAY ${game.short}`}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => onStart(false)}>
              PLAY CONNECTED GMAIL
            </Button>
            <Button variant="ghost" onClick={onLeaderboard}>
              ★ HIGH SCORES
            </Button>
          </div>
          <div className="lobby-controls">
            <b>CONTROLS</b>
            <p>{game.instructions}</p>
          </div>
          <p className="lobby-safety">
            Demo uses mock mail. Successful actions are reviewed before applying. All games support
            undo.
          </p>
        </div>
        <HeroPlayground />
      </div>
    </section>
  );
}
