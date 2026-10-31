# Milo: approved Rive character

The application uses one character implementation on the homepage and in missions.

- `frontend/public/characters/milo.riv`: the approved Kid Character Animation.
- `frontend/src/game/RiveBoy.jsx`: the only canvas renderer and movement controller.
- `frontend/src/game/Buddy.jsx`: shared captions, reactions, voice and attribution.
- `frontend/src/game/buddy.css`: all character and speech-bubble layout styles.
- `frontend/src/components/hero-playground.css`: homepage character stage.
- `frontend/src/components/interactive.css`: cursor and general website effects.
- `frontend/src/game/arcade.css`: mission environment and mail portals.

The old SVG boy, its facial layers and animation keyframes, obsolete eye-follow
code, and comparison-page assets have been removed. There is no second renderer
or old-character fallback. Loading failures show an explicit message.

The original artboard is `Accung`. Its published animation clips used here are
`idle`, `walking` and `Run`. The canvas presentation crops out the source's demo
buttons. The original character file remains unmodified. Actions play a short walk;
celebrations and pokes play a short run, then return to idle. Pointer movement tilts
the character wrapper slightly; it does not control individual pupils or the head.
Motion preferences pause animation. Voice is browser speech, with captions always
available. Talking is indicated visually but does not animate the source's mouth.

This asset does not include independent pupil controls, lip sync, or a collection
of laughing/taunting facial poses. Those would require editing its Rive rig, not
stacking the old drawing over it. See the asset attribution for author and license.

The runtime JavaScript, WebAssembly and artwork are served by the application.
No animation CDN is needed at runtime. The CSP permits WebAssembly compilation
with `wasm-unsafe-eval`; general JavaScript `unsafe-eval` remains disabled.
