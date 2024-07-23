import { COLLISION_FILTER_1 } from '@/constants/plinko';
import Matter from 'matter-js';

export const createLetter = (
  char: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fillColor: string,
  label: string
) => {
  const letter = Matter.Bodies.rectangle(x, y, 40, 60, {
    isStatic: true,
    label: label,
    render: {
      sprite: {
        texture: `data:image/svg+xml;utf8,
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="${width}"
              height="${height}"
            >
              <text
                x="10%"
                y="10%"
                dominant-baseline="middle"
                font-weight="bold"
                text-anchor="middle"
                font-family="Arial"
                font-size="${fontSize}"
                fill="${fillColor}"
              >
                ${char.toUpperCase()}
              </text>
            </svg>`,
        xScale: 1,
        yScale: 1,
      },
    },
    collisionFilter: COLLISION_FILTER_1,
  });
  return letter;
};
