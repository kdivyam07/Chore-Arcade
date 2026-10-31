import { useState } from 'react';
import Buddy, { reaction } from '../game/Buddy';
import './hero-playground.css';
export default function HeroPlayground() {
  const [event, setEvent] = useState(() => ({
    kind: 'welcome',
    text: "I'm Milo, your arcade sidekick. Pick a machine. I'll bring the questionable jokes!",
    id: 0,
  }));
  return (
    <div className="hero-playground">
      <div className="playground-label">
        <span>
          <i /> MILO / PLAYER TWO
        </span>
        <b>ARCADE ONLINE</b>
      </div>
      <div className="playground-stars" aria-hidden="true">
        <span>✦</span>
        <span>✳</span>
        <span>+</span>
        <span>✧</span>
      </div>
      <div className="playground-orbit" />
      <div className="playground-orbit second" />
      <Buddy variant="hero" event={event} pose="idle" onTap={() => setEvent(reaction('tap'))} />
      <div className="playground-bottom">
        <span>CHOOSE A MACHINE · CLEAR SOME CLUTTER</span>
        <span>🏏</span>
      </div>
    </div>
  );
}
