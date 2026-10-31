import { useEffect, useRef, useState } from 'react';
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-canvas';
import wasmUrl from '@rive-app/canvas/rive.wasm?url';

// Ship the runtime with the app: no CDN calls or remote scripts at play time.
RuntimeLoader.setWasmUrl(wasmUrl);
RuntimeLoader.setWasmFallbackUrl(null);
const CLIPS = { idle: 'idle', walk: 'walking', run: 'Run' };

export default function RiveBoy({ pose, eventId, speaking, onTap }) {
  const [failed, setFailed] = useState(false),
    [motion, setMotion] = useState(false),
    [animation, setAnimation] = useState('');
  const wrapper = useRef(null),
    reset = useRef(null);
  const { rive, RiveComponent } = useRive({
    src: '/characters/milo.riv',
    artboard: 'Accung',
    autoplay: true,
    shouldDisableRiveListeners: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });

  function playMovement(kind) {
    if (!rive) return;
    const clip = CLIPS[kind];
    rive.stop();
    rive.play(clip);
    setAnimation(clip);
  }

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () =>
      setMotion(!media.matches && document.documentElement.classList.contains('playful-motion'));
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    media.addEventListener('change', sync);
    sync();
    return () => {
      observer.disconnect();
      media.removeEventListener('change', sync);
    };
  }, []);
  useEffect(() => {
    if (!rive) return;
    if (!motion) {
      playMovement('idle');
      rive.pause();
      return;
    }
    playMovement(
      pose === 'celebrate' ? 'run' : ['archive', 'keep', 'read'].includes(pose) ? 'walk' : 'idle',
    );
    reset.current = setTimeout(() => playMovement('idle'), 1600);
    return () => clearTimeout(reset.current);
  }, [rive, motion, pose, eventId]);
  useEffect(() => {
    if (!motion) return;
    function look(event) {
      const r = wrapper.current?.getBoundingClientRect();
      if (r)
        wrapper.current.style.setProperty(
          '--lean',
          `${Math.max(-5, Math.min(5, (event.clientX - r.left - r.width / 2) / 100))}deg`,
        );
    }
    window.addEventListener('pointermove', look);
    return () => {
      window.removeEventListener('pointermove', look);
      wrapper.current?.style.removeProperty('--lean');
    };
  }, [motion]);
  useEffect(() => () => clearTimeout(reset.current), []);
  function greet() {
    onTap();
  }
  return (
    <button
      ref={wrapper}
      className={`milo-character ${speaking ? 'milo-speaking' : ''}`}
      aria-label="Say hello to Milo"
      onClick={greet}
      onPointerEnter={() => {
        if (motion) playMovement('walk');
      }}
      onPointerLeave={() => {
        if (motion) playMovement('idle');
      }}
      data-character="rive-kid"
      data-loaded={!!rive}
      data-pose={pose}
      data-animation={animation}
    >
      {failed ? (
        <span className="milo-load-message">Milo couldn’t load. Refresh to retry.</span>
      ) : (
        <>
          <span className="milo-crop" aria-hidden="true">
            <RiveComponent className="milo-scene" />
          </span>
          {!rive && <span className="milo-load-message">Waking Milo up…</span>}
        </>
      )}
      <span className="milo-state" aria-hidden="true">
        {speaking ? '♫ MILO IS TALKING' : pose === 'celebrate' ? 'LET’S GOOO!' : 'POKE ME ↗'}
      </span>
    </button>
  );
}
