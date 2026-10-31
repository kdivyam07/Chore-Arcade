# Chore Arcade: game registry and shared execution

The lobby offers three implemented games: Inbox Six, Orbit Blaster and Hoop Hustle.
`game/catalog.js` defines ids, names, controls, accents and local score units.
`game/GameField.jsx` lazy-loads the selected game's renderer. There is one Mission
component for the timer, pause, commentary, action queue, preview, execution and report.

Every renderer receives the same props: message, remaining, disabled, onDecision
and onFeedback. A renderer must call onDecision(action, gamePoints) exactly once
after a successful play. It never calls the email API itself. The disabled flag
freezes the animation clock during countdowns, pause, review and timeouts.

Shared EmailBrief and ActionTargets components render actual email candidates and
explicit destination choices. `shared/field.css` owns their presentation and the
mission layout. `shared/useGameLoop.js` owns the frame lifecycle for the two new
games. Each sport's visual and input rules live in its own directory.

- Cricket: choose a destination, bowl, and time the swing. Timing yields 2/4/6 runs.
- Blaster: aim a reticle at a moving email asteroid and fire. Only hits queue actions.
  Mouse and arrow-key aiming are available; relaxed mode provides automatic aim.
- Hoops: pull back from the ball and release to launch a ballistic shot. The ball
  must descend through the selected rim. A guided-shot button provides a keyboard
  and timing-free alternative using the same projectile physics.

Misses keep the candidate unchanged. The selected action is locked during a shot.
The round report labels game points separately from server-confirmed chore points;
the shared leaderboard still uses only the latter. Demo play remains clearly labeled.

To add another game, add catalog metadata and a lazy component entry, implement
the renderer contract, add specific feedback lines, and test a successful play,
a miss, explicit target selection, confirmation and undo. Do not duplicate the
chore backend, Rive character renderer, scoring API, or session ownership logic.
