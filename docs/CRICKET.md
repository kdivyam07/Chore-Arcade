# Inbox Premier League

A short cricket innings uses actual email candidates as balls. The player reads
the sender/subject/snippet, selects Archive, Mark read, or Keep, then bowls and
times a swing. Space and a visible button both bowl/swing; 1/2/3 or arrow keys
select the action. Target selection locks during a delivery and ball flight.

Good timing earns 2, 4, or 6 local cricket runs. A miss never queues an email action
and retries the same email. Relaxed mode removes timing pressure while retaining
explicit target selection and a shot. Successful shots queue an action only after
the ball lands. Pausing freezes the ball's animation clock as well as mission time.

The match has a 120-second limit and a finite queue. After the last candidate or
timeout, players can review and apply the successful decisions. Review/confirmation,
idempotent backend execution, the operation report and undo remain unchanged.
Cricket runs are local game feedback; leaderboard chore points still come only
from backend-confirmed actions. Do not imply demo gameplay modifies a real inbox.

`cricket/physics.js` owns timing judgement and delivery/shot trajectories.
`cricket/CricketField.jsx` owns input and the ready/flight/hit/miss lifecycle.
`cricket/CricketPitch.jsx` draws the stadium, pitch, bat and email-ball as SVG.
`cricket/cricket.css` owns the field presentation. The same Milo renderer supplies
commentary. The former direct-action portals and practice-mail mini-game are removed.

Inspiration: https://slamsort-web-162765212832.asia-south1.run.app/
No source code or assets from that application were copied.
