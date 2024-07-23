import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, Bodies, World, Body } from 'matter-js';
import styles from '@/styles/PlinkoGameboard.module.css';
import { Button, useDisclosure } from '@chakra-ui/react';
import { GameContext } from '@/contexts/maze/GameContextProvider';
import ModalRules from './ModalRules';
import { RenderCheddarIcon } from '../maze/RenderCheddarIcon';
import {
  BALL_RADIUS,
  BALL_OPTIONS,
  BALL_PREVIEW_OPTIONS,
  CURRENT_WIDTH,
  GOALS,
  GRAVITY,
  HIT_MACHINE_FORCE_MAGNITUDE,
  INITIAL_CLIENT_HEIGHT,
  MAX_BALLS_AMOUNT,
  PIN_RADIUS,
  PIN_SPACING,
  PRIZES_DATA,
  ROWS,
  SIDE_WALLS_OPTIONS,
  WALL_POSITION_ADJUST,
  BOTTOM_WALL_OPTIONS,
  PIN_OPTIONS,
  PIN_DECORATIVE_1_OPTIONS,
  PIN_DECORATIVE_2_OPTIONS,
  GOALS_OPTIONS,
  GOALS_TIPS_OPTIONS,
} from '@/constants/plinko';
import { callEndGame } from '@/queries/plinko/api';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { createLetter } from './RenderLetterInWorld';
import { ModalContainer } from '../ModalContainer';
import { GameOverModalContent } from './GameOverModalContent';

interface CheddarEarnedData {
  name: 'giga' | 'mega' | 'micro' | 'nano' | 'splat';
  cheddar: number;
}

export function PlinkoBoard() {
  const { isMobile, seedId, closePlinkoModal, pendingCheddarToMint } =
    React.useContext(GameContext);

  const { accountId, selector } = useWalletSelector();

  const [clientHeight, setClientHeight] = useState<number>(
    INITIAL_CLIENT_HEIGHT
  );
  const [saveResponse, setSaveResponse] = useState<string[] | undefined>();
  const [endGameResponse, setEndGameResponse] = useState<undefined | any>();
  const [thrownBallsQuantity, setThrownBallsQuantity] = useState(0);
  const [ballFinishLines, setBallFinishLines] = useState<number[]>([]);
  const [currentXPreview, setCurrentXPreview] = useState<undefined | number>();
  const [prize, setPrize] = useState<number>();
  const [prizeNames, setPrizeNames] = useState<
    ('giga' | 'mega' | 'micro' | 'nano' | 'splat')[]
  >([]);
  const [showPrize, setShowPrize] = useState(false);
  const [ballsYPosition, setBallsYPosition] = useState<number[]>(
    Array.from(Array(MAX_BALLS_AMOUNT).keys()).fill(0)
  );

  const [gameOverFlag, setGameOverFlag] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [allowOpenGameOverModal, setAllowOpenGameOverModal] = useState(false);

  const scene = useRef() as React.LegacyRef<HTMLDivElement> | undefined;
  const engine = useRef(Engine.create());

  const {
    isOpen: isOpenModalRules,
    onOpen: onOpenModalRules,
    onClose: onCloseModalRules,
  } = useDisclosure();

  function closeGameOverModal() {
    closePlinkoModal();
    setGameOverMessage('');
    onClose();
    setAllowOpenGameOverModal(false);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (gameOverFlag && gameOverMessage.length > 0 && !allowOpenGameOverModal) {
    onOpen();
    setAllowOpenGameOverModal(true);
  }

  useEffect(() => {
    engine.current.world.gravity.y = GRAVITY;
  }, []);

  useEffect(() => {
    const thrownBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );

    const currentBallYPositions = thrownBalls.map((ball) => ball.position.y);
    if (
      currentBallYPositions.filter(
        (ballYPosition) => ballYPosition <= clientHeight
      ).length > 0
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
      }, 100);
    }

    const ballsInGoal = thrownBalls.filter(
      (ball) => ball.position.y > clientHeight
    );

    if (ballsInGoal.length > 0) {
      const separatorArray = engine.current.world.bodies.filter(
        (body) => body.label === 'separator'
      );
      const ballSeparatorIndexArray = [] as number[];

      for (let i = 0; i < ballsInGoal.length; i++) {
        const ball = ballsInGoal[i];

        const index = separatorArray.findIndex((separator) => {
          return ball?.position.x < separator.position.x;
        });

        ballSeparatorIndexArray.push(index);

        if (ball.position.y > clientHeight) {
          setBallFinishLines((prevState) => [
            ...prevState,
            ...ballSeparatorIndexArray,
          ]);

          removeBody(ball);
        }
      }
    }
  }, [ballsYPosition, thrownBallsQuantity]);

  useEffect(() => {
    let finalPrize = 0;
    ballFinishLines.forEach((finishGoal) => {
      const cheddarEarnedData = PRIZES_DATA.find((prizeData) => {
        return prizeData.name === GOALS[finishGoal - 1];
      }) as CheddarEarnedData;

      if (cheddarEarnedData) {
        const cheddarEarned = cheddarEarnedData?.cheddar;
        const cheddarPrizeName = cheddarEarnedData?.name;
        console.log(1, cheddarPrizeName);
        setPrizeNames((prevState) => [...prevState, cheddarPrizeName]);

        finalPrize += cheddarEarned!;
      }
    });

    if (ballFinishLines.length > 0) {
      finalPrize = Math.min(pendingCheddarToMint, finalPrize);
      setPrize(finalPrize);
    }
  }, [ballFinishLines]);

  useEffect(() => {
    if (ballFinishLines && ballFinishLines.length === MAX_BALLS_AMOUNT) {
      finishGame();
    }
  }, [prizeNames, prize]);

  useEffect(() => {
    if (prize !== undefined) {
      setShowPrize(true);

      setTimeout(() => {
        setShowPrize(false);
      }, 2000);
    }
  }, [prize]);

  async function finishGame() {
    if (prizeNames[0]) {
      const endGameRequestData = {
        data: {
          prizeEarned: prizeNames[0],
        },
        metadata: {
          accountId: accountId!,
          seedId,
        },
      };

      setGameOverFlag(true);
      setGameOverMessage(`Your ball fell in ${prizeNames[0]} goal`);
      const endGameResponse = await callEndGame(endGameRequestData);
      setEndGameResponse(endGameResponse);
      if (!endGameResponse.ok) setSaveResponse(endGameResponse.errors);
    }
  }

  function removeBody(body: Matter.Body) {
    World.remove(engine.current.world, body);
  }

  const drawBallPreview = (xPosition: number) => {
    const yPosition = PIN_SPACING;
    const ballPreview = Bodies.circle(
      xPosition,
      yPosition,
      BALL_RADIUS,
      BALL_PREVIEW_OPTIONS
    );
    World.add(engine.current.world, [ballPreview]);
  };

  const drawNewBall = (xPosition: number) => {
    const ballXPosDeviation = Math.floor(Math.random() * 17) - 5;
    const yPosition = PIN_SPACING;
    const ball = Bodies.circle(
      xPosition + ballXPosDeviation,
      yPosition,
      BALL_RADIUS,
      BALL_OPTIONS
    );
    World.add(engine.current.world, [ball]);
  };

  function getCurrentXPosition(x: number) {
    return x - document.body.clientWidth / 2 + CURRENT_WIDTH / 2 + BALL_RADIUS;
  }

  function handleShowNewBallPreviewMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (thrownBallsQuantity >= MAX_BALLS_AMOUNT) return;
    const mouseXPosition = getCurrentXPosition(e.clientX);
    setCurrentXPreview(mouseXPosition);

    handleShowNewBallPreview(mouseXPosition);
  }

  function handleShowNewBallPreviewTouch(e: React.TouchEvent<HTMLDivElement>) {
    const touchXPosition = e.touches[e.touches.length - 1].clientX;
    const previewBallXPosition = touchXPosition - PIN_SPACING;

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

    const currentXPosition = x;

    if (allBalls.length < MAX_BALLS_AMOUNT) {
      if (preview) {
        //Move preview ball
        Matter.Body.setPosition(preview, {
          x: currentXPosition,
          y: PIN_SPACING,
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
    if (allBalls.length + ballFinishLines.length < MAX_BALLS_AMOUNT) {
      const currentXPosition = currentXPreview!;

      drawNewBall(currentXPosition);
      setThrownBallsQuantity(thrownBallsQuantity + 1);
    }
  }

  //This function apply a force in the balls. It's used to unstuck balls if necessary.
  const pushBall = () => {
    const allBalls = engine.current.world.bodies.filter(
      (body) => body.label === 'ball'
    );

    allBalls.forEach((ball) => {
      const forceDirection = Math.random() < 0.5 ? -0.05 : 0.05;
      Body.applyForce(ball, ball.position, {
        x: HIT_MACHINE_FORCE_MAGNITUDE * forceDirection,
        y: 0,
      });
    });
  };

  useEffect(() => {
    if (clientHeight === 0) {
      const currentCh = document.body.clientHeight;
      setClientHeight(currentCh);
    }
    if (scene) {
      const render = Render.create({
        //@ts-ignore
        element: scene!.current,
        engine: engine.current,
        options: {
          width: CURRENT_WIDTH,
          height: clientHeight,
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
          -PIN_SPACING + WALL_POSITION_ADJUST,
          0,
          PIN_SPACING,
          clientHeight * 2,
          SIDE_WALLS_OPTIONS
        ),
        // Right wall
        Bodies.rectangle(
          CURRENT_WIDTH + PIN_SPACING - WALL_POSITION_ADJUST,
          0,
          PIN_SPACING,
          clientHeight * 2,
          SIDE_WALLS_OPTIONS
        ),

        // Bottom wall
        Bodies.rectangle(
          //All background

          // CURRENT_WIDTH / 2,
          // 200,
          // CURRENT_WIDTH,
          // 600,
          // BOTTOM_WALL_OPTIONS

          //Band

          CURRENT_WIDTH / 2,
          clientHeight,
          CURRENT_WIDTH,
          200,
          BOTTOM_WALL_OPTIONS
        ),
      ]);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < GOALS.length + 1; col++) {
          let x = col * PIN_SPACING;
          if (row % 2 === 0) {
            x += PIN_SPACING / 2;
          }

          //Do not create first row
          if (row > 0) {
            const y = PIN_SPACING + row * PIN_SPACING + clientHeight / 20;

            const pin = Bodies.circle(x, y, PIN_RADIUS, PIN_OPTIONS);

            const pinDecorative1 = Bodies.circle(
              x,
              y,
              PIN_RADIUS * 1.5,
              PIN_DECORATIVE_1_OPTIONS
            );

            const pinDecorative2 = Bodies.circle(
              x,
              y,
              PIN_RADIUS * 2,
              PIN_DECORATIVE_2_OPTIONS
            );
            World.add(engine.current.world, [
              pinDecorative2,
              pinDecorative1,
              pin,
            ]);
          }
        }
      }

      //Create finish boxes
      for (let i = 0; i < GOALS.length + 1; i++) {
        const separator = Bodies.rectangle(
          i * PIN_SPACING,
          clientHeight - 50,
          10,
          100,
          GOALS_OPTIONS
        );
        const border = Bodies.circle(
          i * PIN_SPACING,
          clientHeight - 100,
          5.1,
          GOALS_TIPS_OPTIONS
        );

        if (!GOALS[i]) {
          World.add(engine.current.world, [separator, border]);
        } else {
          const goalName = GOALS[i]
            .split('')
            .map((char, charIndex) =>
              createLetter(
                char,
                i * PIN_SPACING + PIN_SPACING,
                clientHeight - 60 + 12 * charIndex,
                50,
                60,
                14,
                'white',
                'goalName'
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

  return (
    <div className={styles.plinkoBoardContainer}>
      <div className={styles.headerContainer}>
        <Button onClick={pushBall} mr={'1rem'}>
          Shake
        </Button>
        <Button onClick={onOpenModalRules} mr={'1rem'}>
          Rules
        </Button>
        <span>Chips left: {MAX_BALLS_AMOUNT - thrownBallsQuantity}</span>
      </div>
      <div
        className={styles.plinkoGame}
        ref={scene}
        onMouseMove={isMobile ? () => {} : handleShowNewBallPreviewMouse}
        onTouchMove={handleShowNewBallPreviewTouch}
        onTouchStart={handleShowNewBallPreviewTouch}
        onTouchEnd={handleTouchEnd}
        onMouseUp={isMobile ? () => {} : handleMouseDropNewBall}
      />

      <ModalRules isOpen={isOpenModalRules} onClose={onCloseModalRules} />

      <div className={styles.displayablePrizeContainer}>
        <span
          className={`${styles.displayablePrize} ${showPrize ? styles.show : styles.hide}`}
        >
          +{prize} {RenderCheddarIcon({ height: '2rem', width: '2rem' })}
        </span>
      </div>
      {saveResponse && (
        <ModalContainer
          title={'Error saving plinko game'}
          isOpen={isOpen}
          onClose={onClose}
        >
          <div>
            {saveResponse.map((error, index) => {
              return <div key={index}>{error}</div>;
            })}
          </div>
        </ModalContainer>
      )}
      {gameOverFlag && gameOverMessage.length > 0 && (
        <ModalContainer
          title={'Game over'}
          isOpen={isOpen}
          onClose={closeGameOverModal}
          closeOnOverlayClick={false}
        >
          <GameOverModalContent
            prizeName={prizeNames[0]}
            cheddarFound={prize!}
            endGameResponse={endGameResponse}
          />
        </ModalContainer>
      )}
    </div>
  );
}
