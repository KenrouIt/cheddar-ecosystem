export const ROWS = 7; //This number should be odd to maximize the randomnes of the game
export const GOALS = [
  'nano',
  'micro',
  'splat',
  'mega',
  'micro',
  'giga',
  'splat',
  'nano',
];
export const PRIZES_DATA = [
  { name: 'splat', cheddar: 0 },
  { name: 'nano', cheddar: 5 },
  { name: 'micro', cheddar: 10 },
  { name: 'mega', cheddar: 25 },
  { name: 'giga', cheddar: 55 },
];
export const CURRENT_WIDTH = 330;
export const PIN_SPACING = CURRENT_WIDTH / GOALS.length;
export const INITIAL_CLIENT_HEIGHT = 450;
export const PIN_RADIUS = 8;
export const WALL_POSITION_ADJUST = 9;
export const MAX_BALLS_AMOUNT = 1;
export const BALL_RADIUS = 12;
export const BALL_BOUNCINES = 1;
export const BALL_FRICTION = 0.1;
export const HIT_MACHINE_FORCE_MAGNITUDE = 0.05;
export const GRAVITY = 0.3;

export const COLLISION_FILTER_1 = {
  group: -1,
  category: 0x0002,
  mask: 0x0002,
};
export const BALL_PREVIEW_OPTIONS = {
  restitution: 0,
  friction: 0,
  isStatic: true,
  label: 'ballPreview',
  render: { fillStyle: 'rgb(255, 102, 51, 0.8)' },
  collisionFilter: COLLISION_FILTER_1,
};
export const BALL_OPTIONS = {
  restitution: BALL_BOUNCINES,
  friction: BALL_FRICTION,
  label: 'ball',
  render: { fillStyle: 'rgb(255, 102, 51)' },
};
export const SIDE_WALLS_OPTIONS = {
  isStatic: true,
  restitution: 1,
  render: { fillStyle: 'transparent' },
};
export const BOTTOM_WALL_OPTIONS = {
  isStatic: true,
  collisionFilter: COLLISION_FILTER_1,
  // render: { fillStyle: 'rgb(255, 255, 255, 0.5)' },
  // render: { fillStyle: 'rgb(134, 66, 235, 0.6)' },
  render: { fillStyle: 'rgb(134, 66, 235, 0.8)' },
  // render: { fillStyle: 'rgb(99, 45, 144, 0.7)' },
  // render: { fillStyle: 'rgb(134, 66, 235)' },
};
export const PIN_OPTIONS = {
  isStatic: true,
  render: {
    fillStyle: 'white',
  },
};
export const PIN_DECORATIVE_1_OPTIONS = {
  isStatic: true,
  collisionFilter: COLLISION_FILTER_1,
  render: {
    fillStyle: 'rgb(250, 250, 250, 0.5)',
  },
};
export const PIN_DECORATIVE_2_OPTIONS = {
  isStatic: true,
  collisionFilter: COLLISION_FILTER_1,
  render: {
    fillStyle: 'rgb(0, 0, 0, 0.1)',
  },
};
export const GOALS_OPTIONS = {
  isStatic: true,
  label: 'separator',
  friction: 3,
  render: { fillStyle: 'white' },
};
export const GOALS_TIPS_OPTIONS = {
  isStatic: true,
  label: 'separator-tip',
  render: { fillStyle: 'white' },
};
