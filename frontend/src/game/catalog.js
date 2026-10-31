export const GAMES = [
  {
    id: 'cricket',
    title: 'Inbox Six',
    short: 'CRICKET',
    icon: '🏏',
    tag: 'TIMING / SPORTS',
    description: 'Bowl an email. Time your swing. Send it to the boundary.',
    instructions: '1 / 2 / 3 selects a target. SPACE bowls and swings.',
    scoreLabel: 'CRICKET RUNS',
    unit: 'RUNS',
    color: '#c9fa68',
  },
  {
    id: 'blaster',
    title: 'Orbit Blaster',
    short: 'BLASTER',
    icon: '🚀',
    tag: 'AIM / SPACE',
    description: 'Track a moving email asteroid. Aim your cannon and fire.',
    instructions:
      '1 / 2 / 3 selects an action. Aim with mouse or arrows. Click the arena or press SPACE to fire.',
    scoreLabel: 'BLASTER POINTS',
    unit: 'POINTS',
    color: '#70dcff',
  },
  {
    id: 'hoops',
    title: 'Hoop Hustle',
    short: 'HOOPS',
    icon: '🏀',
    tag: 'PHYSICS / SPORTS',
    description: 'Pull back, find your arc, and sink the email-ball.',
    instructions:
      '1 / 2 / 3 selects a hoop. Pull back from the ball and release, or press SPACE for a guided shot.',
    scoreLabel: 'BASKET POINTS',
    unit: 'POINTS',
    color: '#ffc177',
  },
];
export function getGame(id) {
  return GAMES.find((game) => game.id === id) || GAMES[0];
}
