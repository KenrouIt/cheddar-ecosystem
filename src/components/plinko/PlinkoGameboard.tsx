import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, Bodies, World, Body } from 'matter-js';
import { color } from 'framer-motion';
import { Button, useDisclosure } from '@chakra-ui/react';
import { sep } from 'path';
import { GameContext } from '@/contexts/maze/GameContextProvider';
import ModalRules from './ModalRules';

export function PlinkoBoard() {
  const { cheddarFound, setCheddarFound, isMobile } =
    React.useContext(GameContext);

  const [rows, setRows] = useState(7); //This number should be odd to maximize the randomnes of the game
  const [goals, setGoals] = useState([
    'NANO',
    'MICRO',
    'SPLAT',
    'MEGA',
    'MICRO',
    'GIGA',
    'SPLAT',
    'NANO',
  ]);
  const [cw, setCw] = useState<number>(330);
  const [ch, setCh] = useState<number>(450); //If this get's changed don't forget to change the value on the reference "*change this if ch change*"

  const [pinSpacing, setPinSpacing] = useState<number>(cw / goals.length);
  const [pinRadius, setPinRadius] = useState(8);

  const [wallPositionAdjust, setWallPositionAdjust] = useState(9);

  const [maxBallsAmount, setMaxBallsAmount] = useState(3);
  const [ballRadius, setBallRadius] = useState(12);
  const [ballBouncines, setBallBouncines] = useState(1);
  const [ballFriction, setBallFriction] = useState(0.1);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const [hitMachineForceMagnitude, setHitMachineForceMagnitude] =
    useState(0.05);

  const [thrownBallsQuantity, setThrownBallsQuantity] = useState(0);
  const [ballsYPosition, setBallsYPosition] = useState<number[]>(
    Array.from(Array(maxBallsAmount).keys()).fill(0)
  );
  const [ballFinishLines, setBallFinishLines] = useState<number[]>([]);
  const [currentXPreview, setCurrentXPreview] = useState<undefined | number>();

  const scene = useRef() as React.LegacyRef<HTMLDivElement> | undefined;
  const engine = useRef(Engine.create());

  engine.current.world.gravity.y = 0.3;

  const {
    isOpen: isOpenModalRules,
    onOpen: onOpenModalRules,
    onClose: onCloseModalRules,
  } = useDisclosure();

  useEffect(() => {
    const thrownBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );

    const currentBallYPositions = thrownBalls.map((ball) => ball.position.y);
    if (
      //If at least 1 ball is not in the end
      currentBallYPositions.filter((ballYPosition) => ballYPosition < 350) // change this if ch change
        .length > 0
    ) {
      const newYPositions = [] as number[];

      ballsYPosition.forEach((ballYPosition, index) => {
        const ball = thrownBalls[index];
        newYPositions.push(
          ballYPosition === ball?.position.y
            ? ballYPosition - 1
            : ball?.position.y
        );
      });

      setTimeout(() => {
        setBallsYPosition(newYPositions);
      }, 500);
    }

    const ballsInGoal = thrownBalls.filter(
      (ball) => ball.position.y > 350 // change this if ch change
    );

    if (
      /*If a ball have reach a goal*/
      ballsInGoal.length > 0
    ) {
      const separatorArray = engine.current.world.bodies.filter(
        (body) => body.label === 'separator'
      );
      const ballSeparatorIndexArray = [] as number[];

      //Loops on every ball
      for (let i = 0; i < ballsInGoal.length; i++) {
        const ball = ballsInGoal[i];

        const index = separatorArray.findIndex((separator) => {
          return ball?.position.x < separator.position.x;
        });

        ballSeparatorIndexArray.push(index);

        if (
          //If the ball is out of the screen
          ball.position.y > ch
        ) {
          setBallFinishLines([...ballFinishLines, ...ballSeparatorIndexArray]);
          removeBody(ball);
        }
      }
    }

    if (ballFinishLines && ballFinishLines.length === maxBallsAmount) {
      finishGame();
    }
  }, [ballsYPosition, thrownBallsQuantity, ballFinishLines]);

  function getCheddarEarnedOnPlinko() {
    //TODO do this function
    return 0;
  }

  function finishGame() {
    if (isGameFinished) return;
    setCheddarFound(cheddarFound + getCheddarEarnedOnPlinko());
    setIsGameFinished(true);
  }

  function removeBody(body: Matter.Body) {
    World.remove(engine.current.world, body);
  }

  const drawBallPreview = (xPosition: number) => {
    const yPosition = pinSpacing;
    const ballPreview = Bodies.circle(xPosition, yPosition, ballRadius, {
      restitution: 0,
      friction: 0,
      isStatic: true,
      label: 'ballPreview',
      render: { fillStyle: 'rgb(245, 152, 47, 0.8)' },
      collisionFilter: {
        group: -1,
        category: 0x0002,
        mask: 0x0002,
      },
    });
    World.add(engine.current.world, [ballPreview]);
  };

  const createLetter = (char: string, x: number, y: number) => {
    const letter = Matter.Bodies.rectangle(x, y, 40, 60, {
      isStatic: true,
      label: 'text',
      render: {
        sprite: {
          texture: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="60"><text x="10%" y="10%" dominant-baseline="middle" font-weight="bold" text-anchor="middle" font-family="Arial" font-size="14" fill="black">${char}</text></svg>`,
          xScale: 1,
          yScale: 1,
        },
      },
      collisionFilter: {
        group: -1,
        category: 0x0002,
        mask: 0x0002,
      },
    });
    return letter;
  };

  const drawNewBall = (xPosition: number) => {
    const ballXPosDeviation = Math.floor(Math.random() * 17) - 5;
    const yPosition = pinSpacing;
    const ball = Bodies.circle(
      xPosition + ballXPosDeviation,
      yPosition,
      ballRadius,
      {
        restitution: ballBouncines,
        friction: ballFriction,
        label: 'ball',
        render: { fillStyle: 'rgb(245, 152, 47)' },
      }
    );
    World.add(engine.current.world, [ball]);
  };

  function getCurrentXPosition(x: number) {
    return x - document.body.clientWidth / 2 + cw / 2 + ballRadius;
  }

  function handleShowNewBallPreviewMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (thrownBallsQuantity >= maxBallsAmount) return;
    const mouseXPosition = getCurrentXPosition(e.clientX);
    setCurrentXPreview(mouseXPosition);

    handleShowNewBallPreview(mouseXPosition);
  }

  function handleShowNewBallPreviewTouch(e: React.TouchEvent<HTMLDivElement>) {
    const touchXPosition = e.touches[e.touches.length - 1].clientX;
    const previewBallXPosition = touchXPosition - pinSpacing;

    setCurrentXPreview(previewBallXPosition);

    handleShowNewBallPreview(previewBallXPosition);
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const preview = engine.current.world.bodies.find(
      (body) => body.label === 'ballPreview'
    );

    if (preview) removeBody(preview!);

    handleDropNewBall();
    setCurrentXPreview(undefined);
  }

  function handleShowNewBallPreview(x: number) {
    const allBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );
    const preview = engine.current.world.bodies.find(
      (body) => body.label === 'ballPreview'
    );

    // const currentXPosition = getCurrentXPosition(x);
    const currentXPosition = x;

    if (allBalls.length < maxBallsAmount) {
      if (preview) {
        //Move preview ball
        Matter.Body.setPosition(preview, {
          x: currentXPosition,
          y: pinSpacing,
        });
      } else {
        drawBallPreview(currentXPosition);
      }
    }
  }

  function handleMouseDropNewBall(e: React.MouseEvent<HTMLDivElement>) {
    handleDropNewBall();
  }

  function handleDropNewBall() {
    const preview = engine.current.world.bodies.find(
      (body) => body.label === 'ballPreview'
    );
    const allBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );

    if (preview) {
      removeBody(preview);
    }
    if (allBalls.length + ballFinishLines.length < maxBallsAmount) {
      // const currentXPosition = getCurrentXPosition(currentXPreview!);
      const currentXPosition = currentXPreview!;

      drawNewBall(currentXPosition);
      setThrownBallsQuantity(thrownBallsQuantity + 1);
    }
  }

  //This function aply a force in the balls. It's used to unstuck balls if necessary.
  const pushBall = () => {
    const allBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );

    allBalls.forEach((ball) => {
      const forceDirection = Math.random() < 0.5 ? -0.05 : 0.05;
      Body.applyForce(ball, ball.position, {
        x: hitMachineForceMagnitude * forceDirection,
        y: 0,
      });
    });
  };

  useEffect(() => {
    if (ch === 0) {
      const currentCh = document.body.clientHeight;
      setCh(currentCh);
    }
    if (scene) {
      const render = Render.create({
        element: scene!.current,
        engine: engine.current,
        options: {
          width: cw,
          height: ch,
          wireframes: false,
          background: 'transparent',
        },
      });
      if (engine.current.world.bodies.length > 0) {
        World.clear(engine.current.world, false);
      }

      //Create world
      // Left wall
      World.add(engine.current.world, [
        Bodies.rectangle(
          -pinSpacing + wallPositionAdjust,
          0,
          pinSpacing,
          ch * 2,
          {
            isStatic: true,
            restitution: 1,
            render: { fillStyle: 'transparent' },
          }
        ),
        // Right wall
        Bodies.rectangle(
          cw + pinSpacing - wallPositionAdjust,
          0,
          pinSpacing,
          ch * 2,
          {
            isStatic: true,
            restitution: 1,
            render: { fillStyle: 'transparent' },
          }
        ),

        // Bottom wall
        Bodies.rectangle(cw / 2, ch + 30, cw, 100, {
          isStatic: true,
          collisionFilter: {
            group: -1,
            category: 0x0002,
            mask: 0x0002,
          },
          render: { fillStyle: 'rgb(255, 255, 255, 0.7)' },
        }),
      ]);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < goals.length + 1; col++) {
          let x = col * pinSpacing;
          if (row % 2 === 0) {
            x += pinSpacing / 2;
          }
          const y = pinSpacing + row * pinSpacing + ch / 20;

          const pin = Bodies.circle(x, y, pinRadius, {
            isStatic: true,
            render: {
              fillStyle: 'white',
            },
          });

          const pinDecorative1 = Bodies.circle(x, y, pinRadius * 1.5, {
            isStatic: true,
            collisionFilter: {
              group: -1,
              category: 0x0002,
              mask: 0x0002,
            },
            render: {
              fillStyle: 'rgb(250, 250, 250, 0.5)',
            },
          });

          const pinDecorative2 = Bodies.circle(x, y, pinRadius * 2, {
            isStatic: true,
            collisionFilter: {
              group: -1,
              category: 0x0002,
              mask: 0x0002,
            },
            render: {
              fillStyle: 'rgb(0, 0, 0, 0.1)',
            },
          });
          World.add(engine.current.world, [
            pinDecorative2,
            pinDecorative1,
            pin,
          ]);
        }
      }

      //Create finish boxes
      for (let i = 0; i < goals.length + 1; i++) {
        const separator = Bodies.rectangle(i * pinSpacing, ch - 50, 10, 100, {
          isStatic: true,
          label: 'separator',
          friction: 3,
          render: { fillStyle: 'white' },
        });
        const border = Bodies.circle(i * pinSpacing, ch - 100, 5.1, {
          isStatic: true,
          label: 'separator-tip',
          render: { fillStyle: 'white' },
        });

        if (!goals[i]) {
          World.add(engine.current.world, [separator, border]);
        } else {
          const goalName = goals[i]
            .split('')
            .map((char, charIndex) =>
              createLetter(
                char,
                i * pinSpacing + pinSpacing,
                ch - 60 + 12 * charIndex
              )
            );
          World.add(engine.current.world, [separator, border, ...goalName]);
        }
      }

      //Start running and rendering
      Engine.run(engine.current);
      Render.run(render);

      return () => {
        Render.stop(render);
        World.clear(engine.current.world, true);
        Engine.clear(engine.current);
        render.canvas.remove();
      };
    }
  }, []);

  console.log('ballFinishLines: ', ballFinishLines);

  return (
    <div
      style={{
        height: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'left',
          gap: '1rem',
        }}
      >
        <Button onClick={pushBall}>Hit machine</Button>
        <Button onClick={onOpenModalRules}>Rules</Button>
        <span>Balls left: {maxBallsAmount - thrownBallsQuantity}</span>
      </div>
      <div
        ref={scene}
        onMouseMove={isMobile ? () => {} : handleShowNewBallPreviewMouse}
        onTouchMove={handleShowNewBallPreviewTouch}
        onTouchStart={handleShowNewBallPreviewTouch}
        onTouchEnd={handleTouchEnd}
        onMouseUp={isMobile ? () => {} : handleMouseDropNewBall}
      />

      <ModalRules isOpen={isOpenModalRules} onClose={onCloseModalRules} />
    </div>
  );
}
