import { useEffect, useRef, useState, lazy, Suspense } from 'react';
const RiveBoy = lazy(() => import('./RiveBoy'));
import './buddy.css';

const lines = {
  blasterWelcome: ['Welcome to deep inbox! Pick an action, aim at the email asteroid, and fire!'],
  hoopsWelcome: ['Welcome to the court! Choose a hoop, pull back the email-ball, and let it fly!'],
  spaceLaunch: [
    "Pew pew! No, that isn't the Wi-Fi router. Aim at the email!",
    'Laser mail delivery! Please keep all planets intact.',
  ],
  spaceMiss: [
    'Missed! The asteroid dodged you. The email is still safe!',
    'Space is huge, captain. Your target is the one with the envelope!',
  ],
  hoopsLaunch: [
    "From downtown! Let's see that arc!",
    "Air mail! That is literally what you're doing now.",
  ],
  hoopsMiss: [
    'Oops! Even the rim said nope. Same email, another shot!',
    'That was a pass to the moon. Try the hoop this time!',
  ],
  bowl: [
    'Here comes the mail-ball! Eyes on the crease, captain!',
    "One email. One ball. Please don't hit the umpire!",
  ],
  miss: [
    'Haha! The ball went past, but your email is safe. Try again!',
    'Swing and a miss! Were you batting or swatting a mosquito?',
    'No harm done, captain. Same email, another delivery!',
  ],
  six: [
    'SIX! That ball needs a boarding pass!',
    'Out of the park! Who taught you that shot, captain?',
    'What a hit! Even the inbox is applauding!',
  ],
  welcome: [
    "I'm Milo, your inbox sidekick. Choose a target, bowl the email, then time your shot!",
    "Okay boss, two minutes. Let's rescue this inbox!",
  ],
  archive: [
    'Archive queued! That mail is moving out, not disappearing forever.',
    "Ha ha! Making room already? Look who's being productive!",
    'One less distraction queued. Your inbox can almost breathe.',
  ],
  important: [
    'Plot twist! That might be useful. Check it before confirming that archive.',
    'Whoa, boss! This looks important. Your call, but take another look in the preview.',
  ],
  read: [
    'Reading mode! Look at you, facing your responsibilities!',
    'Mark-read queued. You did actually read it, right? He he!',
    'Unread badge, your days are numbered. Queued!',
  ],
  keep: [
    'Keeping it? Fair. Some messages deserve a seat at the table.',
    'Useful mail stays! A thoughtful decision, boss.',
    'Okay, VIP treatment for this one. Keeping it queued.',
  ],
  idle: [
    'Psst! Are we sorting mail or waiting for it to sort itself?',
    "Ha ha, the inbox isn't going to clean itself, sleepy captain!",
    "I'm tiny, but even I can't carry this whole inbox alone!",
  ],
  preview: ['Inspection time! Review the plan. Nothing has changed yet.'],
  success: [
    "Confirmed! The backend did the work. Now that's teamwork!",
    'Boom! Changes applied. You earned that little victory dance!',
  ],
  error: ["Oops, that didn't finish. Let's retry. No imaginary victory points!"],
  tap: [
    "Hey! I'm the sidekick, not the email. Try playing the game!",
    'He he! That tickles. Now, back to the inbox!',
  ],
};
export function reaction(kind, message) {
  const useful =
    /interview|bill|security|ticket|payment|confirmation|review|feedback|deadline/i.test(
      message?.subject || '',
    );
  const category = kind === 'archive' && useful ? 'important' : kind;
  const options = lines[category] || lines.welcome;
  return {
    kind: category,
    text: options[Math.floor(Math.random() * options.length)],
    id: Date.now() + Math.random(),
  };
}

export default function Buddy({ event, pose, onTap, variant = 'mission' }) {
  const [voice, setVoice] = useState(false),
    [speaking, setSpeaking] = useState(false);
  const enabled = useRef(false);
  function speak(text) {
    if (!enabled.current || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith('en'));
    // Prefer lighter voices over the platform's often deep default male voice.
    const preferred = [
      'Microsoft Zira',
      'Microsoft Ana',
      'Microsoft Jenny',
      'Google UK English Female',
      'Microsoft Aria',
      'Samantha',
      'Karen',
      'Google US English',
    ];
    utterance.voice =
      preferred.map((name) => voices.find((v) => v.name.includes(name))).find(Boolean) ||
      voices.find((v) => !/David|Mark|George|James|Guy|Male/i.test(v.name)) ||
      voices[0] ||
      null;
    utterance.lang = utterance.voice?.lang || 'en-US';
    utterance.pitch = 1.85;
    utterance.rate = 1.22;
    utterance.volume = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    speak(event.text);
  }, [event]);
  useEffect(() => {
    // Ask the browser to populate its asynchronously loaded voice list early.
    window.speechSynthesis?.getVoices();
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);
  function toggle() {
    const next = !voice;
    enabled.current = next;
    setVoice(next);
    if (next) speak(event.text);
    else {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
  }
  return (
    <div className={`buddy-area buddy--${variant} pose-${pose} mood-${event.kind}`}>
      <div className="buddy-caption">
        <span className="buddy-name">
          <i /> MILO / YOUR INBOX SIDEKICK
        </span>
        <p aria-live="polite" key={event.id}>
          {event.text}
        </p>
        <button className="voice-toggle" onClick={toggle} aria-pressed={voice}>
          {voice ? '♫ Voice on · mute' : '♪ Enable Milo’s voice'}
        </button>
      </div>
      <Suspense
        fallback={<span className="milo-character milo-load-message">Waking Milo up…</span>}
      >
        <RiveBoy
          pose={event.kind === 'tap' ? 'celebrate' : pose}
          eventId={event.id}
          speaking={speaking}
          onTap={onTap}
        />
      </Suspense>
      <p className="buddy-credit">
        Character by{' '}
        <a
          href="https://rive.app/marketplace/21142-40026-kid-character-animation/"
          target="_blank"
          rel="noopener noreferrer"
        >
          muh.iswarramadhan
        </a>{' '}
        ·{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY
        </a>
      </p>
    </div>
  );
}
