import { Coordinates } from '@/entities/interfaces';
import React, {
  ReactNode,
  createContext,
  useEffect,
  useState,
  KeyboardEvent,
  TouchEvent,
} from 'react';

import { getSeedId } from '@/queries/api/maze';
import { useWalletSelector } from './WalletSelectorContext';

interface props {
  children: ReactNode;
}

export interface MazeTileData {
  isPath: boolean;
  isActive: boolean;
  enemyWon: boolean;

  hasCheese: boolean;
  hasBag: boolean;
  hasEnemy: boolean;
  hasExit: boolean;
  hasCartel: boolean;
}

interface GameContextProps {
  mazeData: MazeTileData[][];
  setMazeData: React.Dispatch<React.SetStateAction<MazeTileData[][]>>;

  playerPosition: Coordinates;
  setPlayerPosition: React.Dispatch<React.SetStateAction<Coordinates>>;

  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;

  gameOverFlag: boolean;
  setGameOverFlag: React.Dispatch<React.SetStateAction<boolean>>;

  gameOverMessage: string;
  setGameOverMessage: React.Dispatch<React.SetStateAction<string>>;

  timerStarted: boolean;
  setTimerStarted: React.Dispatch<React.SetStateAction<boolean>>;

  direction: 'right' | 'left' | 'down' | 'up';
  setDirection: React.Dispatch<
    React.SetStateAction<'right' | 'left' | 'down' | 'up'>
  >;

  selectedColorSet: number;
  setSelectedColorSet: React.Dispatch<React.SetStateAction<number>>;

  lastCellX: number;
  setLastCellX: React.Dispatch<React.SetStateAction<number>>;
  lastCellY: number;
  setLastCellY: React.Dispatch<React.SetStateAction<number>>;

  hasPowerUp: boolean;
  setHasPowerUp: React.Dispatch<React.SetStateAction<boolean>>;

  isPowerUpOn: boolean;
  setIsPowerUpOn: React.Dispatch<React.SetStateAction<boolean>>;

  remainingTime: number;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;

  timeLimitInSeconds: number;
  setTimeLimitInSeconds: React.Dispatch<React.SetStateAction<number>>;

  remainingMinutes: number;
  setRemainingMinutes: React.Dispatch<React.SetStateAction<number>>;

  remainingSeconds: number;
  setRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;

  cheeseCooldown: boolean;
  setCheeseCooldown: React.Dispatch<React.SetStateAction<boolean>>;

  bagCooldown: boolean;
  setBagCooldown: React.Dispatch<React.SetStateAction<boolean>>;

  enemyCooldown: boolean;
  setEnemyCooldown: React.Dispatch<React.SetStateAction<boolean>>;

  moves: number;
  setMoves: React.Dispatch<React.SetStateAction<number>>;

  won: boolean;
  setWon: React.Dispatch<React.SetStateAction<boolean>>;
  touchStart: Coordinates;
  setTouchStart: React.Dispatch<React.SetStateAction<Coordinates>>;
  touchEnd: Coordinates;
  setTouchEnd: React.Dispatch<React.SetStateAction<Coordinates>>;
  coveredCells: number;
  setCoveredCells: React.Dispatch<React.SetStateAction<number>>;

  mazeRows: number;
  mazeCols: number;
  totalCells: number;

  startTimer(): void;

  handleKeyPress(event: KeyboardEvent<HTMLDivElement>): void;

  restartGame(): void;

  calculateBlurRadius(cellX: number, cellY: number): number;

  handleTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;

  handleTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
}

export const GameContext = createContext<GameContextProps>(
  {} as GameContextProps
);

export const GameContextProvider = ({ children }: props) => {
  const [mazeData, setMazeData] = useState([[]] as MazeTileData[][]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [gameOverFlag, setGameOverFlag] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [timerStarted, setTimerStarted] = useState(false);
  const [direction, setDirection] = useState(
    'right' as 'right' | 'left' | 'down' | 'up'
  );
  const [selectedColorSet, setSelectedColorSet] = useState(0);
  const [lastCellX, setLastCellX] = useState(-1);
  const [lastCellY, setLastCellY] = useState(-1);
  const [hasPowerUp, setHasPowerUp] = useState(false);
  const [isPowerUpOn, setIsPowerUpOn] = useState(false);

  const [timeLimitInSeconds, setTimeLimitInSeconds] = useState(120);
  const [remainingTime, setRemainingTime] = useState(timeLimitInSeconds);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [cheeseCooldown, setCheeseCooldown] = useState(false);
  const [bagCooldown, setBagCooldown] = useState(false);
  const [enemyCooldown, setEnemyCooldown] = useState(false);
  const [moves, setMoves] = useState(0);

  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: -1, y: -1 });
  const [touchEnd, setTouchEnd] = useState({ x: -1, y: -1 });
  const [coveredCells, setCoveredCells] = useState(0);

  const [seedId, setSeedId] = useState(0);

  class RNG {
    state: number;
    m: number = 0x80000000;
    a: number = 1103515245;
    c: number = 12345;

    constructor(seed: number) {
      this.state = seed;
    }

    nextInt() {
      this.state = (this.a * this.state + this.c) % this.m;
      return this.state;
    }

    nextFloat() {
      return this.nextInt() / (this.m - 1);
    }

    nextRange(start: number, end: number) {
      // returns in range [start, end): including start, excluding end
      // can't modulu nextInt because of weak randomness in lower bits
      var rangeSize = end - start;
      var randomUnder1 = this.nextInt() / this.m;
      return start + Math.floor(randomUnder1 * rangeSize);
    }

    choice(array: number[]) {
      return array[this.nextRange(0, array.length)];
    }
  }

  const [rng, setRng] = useState(new RNG(0));

  // const [backgroundImage, setBackgroundImage] = useState('');
  // const [rarity, setRarity] = useState('');

  const mazeRows = 11;
  const mazeCols = 9;
  const totalCells = mazeRows * mazeCols;

  useEffect(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    setRemainingMinutes(minutes);
    setRemainingSeconds(seconds);
  }, [remainingTime]);

  const { accountId } = useWalletSelector();

  // Function to select a random color set, background image, and rarity
  const selectRandomColorSet = () => {
    //Check the global.css file.
    const colorSetsQuantity = 3;

    const randomizeColor = Math.floor(
      Math.floor(Math.random() * colorSetsQuantity) + 1
    );

    return randomizeColor;
  };

  function getRandomPathCell(mazeData: MazeTileData[][]) {
    const pathCells: Coordinates[] = [];
    mazeData.map((row: MazeTileData[], rowIndex: number) => {
      row.map((cell: MazeTileData, colIndex: number) => {
        if (cell.isPath) {
          pathCells.push({ x: colIndex, y: rowIndex });
        }
      });
    });

    return pathCells[rng.nextRange(0, pathCells.length)];
  }

  // Function to restart the game
  async function restartGame() {
    if (!accountId) {
      return;
    }

    const newSeedId = await getSeedId(accountId);
    setSeedId(newSeedId);

    // clearInterval(timerId);
    setScore(0);
    setTimeLimitInSeconds(120);
    setRemainingTime(120);
    setCheeseCooldown(false);
    setBagCooldown(false);
    // setEnemyCooldown(false);
    setMoves(0);
    setGameOverFlag(false);
    setWon(false);
    setGameOverMessage('');
    setDirection('right');

    // Regenerate maze data
    setRng(new RNG(newSeedId));

    const newMazeData = generateMazeData(mazeRows, mazeCols, rng);

    // Set the maze data with the new maze and player's starting position
    setMazeData(newMazeData);

    const playerStartCell = getRandomPathCell(newMazeData);
    setPlayerPosition({ x: playerStartCell.x, y: playerStartCell.y });
    setLastCellX(-1);
    setLastCellY(-1);

    startTimer(); // Start the timer again after resetting the game
  }

  // Function to generate maze data
  function generateMazeData(rows: number, cols: number, rng: RNG) {
    const maze = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isPath: false,
        isActive: false,
        hasCheese: false,
        hasBag: false,
        hasEnemy: false,
        hasExit: false,
        enemyWon: false,
        hasCartel: false,
      }))
    );

    // Choose a random starting position on the outer border
    const startEdge = rng.nextRange(0, 4); // 0: top, 1: right, 2: bottom, 3: left
    let x: number, y: number;

    switch (startEdge) {
      case 0: // Top edge
        x = rng.nextRange(1, cols - 2);
        y = 0;
        break;
      case 1: // Right edge
        x = cols - 1;
        y = rng.nextRange(1, rows - 2);
        break;
      case 2: // Bottom edge
        x = rng.nextRange(1, cols - 2);
        y = rows - 1;
        break;
      case 3: // Left edge
        x = 0;
        y = rng.nextRange(1, rows - 2);
        break;
    }

    maze[y!][x!].isPath = true;
    const stack = [[x!, y!]];

    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const directions: number[][] = [];

      // Check all possible directions
      [
        [2, 0], // Increase step to 2 for wider paths
        [-2, 0], // Increase step to 2 for wider paths
        [0, 2], // Increase step to 2 for wider paths
        [0, -2], // Increase step to 2 for wider paths
      ].forEach(([dx, dy]) => {
        const nx = cx + dx,
          ny = cy + dy;
        if (
          nx >= 0 &&
          nx < cols &&
          ny >= 0 &&
          ny < rows &&
          !maze[ny][nx].isPath
        ) {
          directions.push([nx, ny, cx + dx / 2, cy + dy / 2]); // Adjust coordinates for wider paths
        }
      });

      if (directions.length) {
        const [nx, ny, px, py] =
          directions[rng.nextRange(0, directions.length)];
        maze[ny][nx].isPath = true;
        maze[py][px].isPath = true;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    return maze;
  }

  // Inside the component where you're using the Maze component
  useEffect(() => {
    // Generate maze data and set it to the state
    const newMazeData = generateMazeData(mazeRows, mazeCols, new RNG(0));
    setMazeData(newMazeData);

    const randomColorSet = selectRandomColorSet();
    setSelectedColorSet(randomColorSet);
    // setBackgroundImage(randomColorSet.backgroundImage);
    // setRarity(randomColorSet.rarity);

    const playerStartCell = getRandomPathCell(newMazeData);
    setPlayerPosition({ x: playerStartCell.x, y: playerStartCell.y });
  }, []); // Empty dependency array to run this effect only once on component mount

  function movePlayer(newX: number, newY: number) {
    if (
      !mazeData[newY] ||
      !mazeData[newY][newX] ||
      !mazeData[newY][newX].isPath
    ) {
      return; // Player cannot move to non-path cells
    }

    // Start the timer if it hasn't started yet
    if (!timerStarted) {
      startTimer();
      setTimerStarted(true);
    }

    const newMazeData = mazeData.map((row: MazeTileData[], rowIndex: number) =>
      row.map((cell: MazeTileData, colIndex: number) => ({
        ...cell,
        isActive: rowIndex === newY && colIndex === newX,
      }))
    );

    // Reset isActive for the previous player position
    newMazeData[playerPosition.y][playerPosition.x].isActive = false;

    // Update player position state
    setPlayerPosition({ x: newX, y: newY });

    // Update mazeData state
    setMazeData(newMazeData);

    // Increment moves count
    setMoves(moves + 1);
    setCoveredCells(coveredCells + 1);

    // Periodically add artifacts to the board based on cooldowns and randomness
    addArtifacts(newX, newY, newMazeData, moves);

    // Set lastCellX and lastCellY to the new player position
    // Update last cell coordinates
    setLastCellX(playerPosition.x);
    setLastCellY(playerPosition.y);
  }

  function doesCellHasArtifact(x: number, y: number) {
    return (
      mazeData[y][x].hasCheese ||
      mazeData[y][x].hasBag ||
      mazeData[y][x].hasEnemy ||
      mazeData[y][x].hasCartel ||
      mazeData[y][x].hasExit
    );
  }

  function handleEnemyFound(
    clonedMazeData: MazeTileData[][],
    x: number,
    y: number
  ) {
    // 30% chance of encountering an enemy
    // Code for adding enemy artifact...

    // Add logic for the enemy defeating the player
    if (rng.nextFloat() < 0) {
      // 0% chance of the enemy winning
      clonedMazeData[y][x].enemyWon = true;
      clonedMazeData[y][x].isActive = false;

      setScore(0); // Set score to zero
      gameOver('Enemy won! Game Over!');
    } else {
      clonedMazeData[y][x].hasEnemy = true;

      // setEnemyCooldown(true);
      setTimeout(
        () => {
          // setEnemyCooldown(false);
        },
        rng.nextRange(1000, 6000)
      );
    }
  }

  function handleCheeseFound(
    clonedMazeData: MazeTileData[][],
    x: number,
    y: number
  ) {
    // 5.5% chance of winning cheese
    clonedMazeData[y][x].hasCheese = true;

    setScore(score + 1);
    setCheeseCooldown(true);
    setTimeout(
      () => {
        setCheeseCooldown(false);
      },
      rng.nextRange(1000, 6000)
    );
  }

  function handleBagFound(
    clonedMazeData: MazeTileData[][],
    x: number,
    y: number
  ) {
    // 5.5% chance of winning cheese
    clonedMazeData[y][x].hasBag = true;

    setScore(score + 1);
    setBagCooldown(true);
    setTimeout(
      () => {
        setBagCooldown(false);
      },
      rng.nextRange(1000, 11000)
    );
  }

  function handleCartelFound(
    clonedMazeData: MazeTileData[][],
    x: number,
    y: number
  ) {
    // 0.2% chance of hitting the "cartel" event
    clonedMazeData[y][x].hasCartel = true;

    setScore(0);
    gameOver('You ran into the cartel! Game Over!');
  }

  function handleExitFound(
    clonedMazeData: MazeTileData[][],
    x: number,
    y: number
  ) {
    clonedMazeData[y][x].hasExit = true;
  }

  function addArtifacts(
    newX: number,
    newY: number,
    newMazeData: MazeTileData[][],
    moves: number
  ) {
    if (gameOverFlag /* && moves >= 10*/) {
      return;
    }
    if (newMazeData[newY][newX].hasExit) {
      gameOver('Congrats! You found the Hidden Door.');
      return;
    }
    if (doesCellHasArtifact(newX, newY)) {
      return;
    }

    let clonedMazeData = [...newMazeData];
    if (!enemyCooldown && rng.nextFloat() < 0.3) {
      handleEnemyFound(clonedMazeData, newX, newY);
    } else if (!cheeseCooldown && rng.nextFloat() < 0.055) {
      handleCheeseFound(clonedMazeData, newX, newY);
    } else if (!bagCooldown && rng.nextFloat() < 0.055) {
      handleBagFound(clonedMazeData, newX, newY);
    } else if (rng.nextFloat() < 0.002) {
      handleCartelFound(clonedMazeData, newX, newY);
    } else if (rng.nextFloat() < 0.33 && coveredCells >= 0.75 * totalCells) {
      handleExitFound(clonedMazeData, newX, newY);
    }
    setMazeData(clonedMazeData);
  }

  function stopTimer() {
    // clearInterval(timerId);
    setTimerStarted(false);
  }

  // Function to handle game over
  function gameOver(message: string) {
    setGameOverFlag(true);
    setGameOverMessage(message);
    stopTimer();
  }

  // Define a new useEffect hook to manage the timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (timerStarted && !gameOverFlag) {
      intervalId = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime === 0 && intervalId) {
            clearInterval(intervalId);
            gameOver("⏰ Time's up! Game Over!");
            return prevTime;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    }; // Cleanup function to clear interval on unmount or when timer conditions change
  }, [timerStarted, gameOverFlag]);

  // Function to handle key press events
  function handleKeyPress(event: KeyboardEvent<HTMLDivElement>) {
    if (gameOverFlag) return; // If game over, prevent further movement

    const key = event.key;
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (key) {
      case 'ArrowUp':
        newY--;
        setDirection('up');
        break;
      case 'ArrowDown':
        newY++;
        setDirection('down');
        break;
      case 'ArrowLeft':
        newX--;
        setDirection('left');
        break;
      case 'ArrowRight':
        newX++;
        setDirection('right');
        break;
      default:
        return;
    }

    movePlayer(newX, newY);
    // Update last cell coordinates
    setLastCellX(playerPosition.x);
    setLastCellY(playerPosition.y);
  }

  // Function to start the timer
  function startTimer() {
    if (!timerStarted && !gameOverFlag) {
      setTimerStarted(true);
    }
  }

  function startTimerOnTap() {
    if (!timerStarted) {
      startTimer();
    }
  }

  function calculateBlurRadius(cellX: number, cellY: number) {
    return 0;
    // Check if it can be fixed. It looks bad even with maxBlurRadius=1
    // Check if lastCellX and lastCellY are null or undefined
    if (lastCellX === -1 || lastCellY === -1) {
      // Initialize lastCellX and lastCellY with initial player position
      setLastCellX(playerPosition.x);
      setLastCellY(playerPosition.y);
    }

    // Calculate distance between current cell and last cell
    const distance = Math.sqrt(
      Math.pow(cellX - lastCellX, 2) + Math.pow(cellY - lastCellY, 2)
    );

    // Define max blur radius and adjust based on distance
    const maxBlurRadius = 0; // Adjust as needed
    return Math.min(maxBlurRadius, distance);
  }

  function getCoordinatesFromTileId(id: string) {
    const stringCoordinates = id.slice('cell-'.length);

    const splitedStringCoordinates = stringCoordinates.split('-');

    const finalCoorditane = {
      y: Number(splitedStringCoordinates[0]),
      x: Number(splitedStringCoordinates[1]),
    };

    return finalCoorditane as Coordinates;
  }

  function isValidTileToMove(coordinates: Coordinates) {
    //If the coordinate is part of the path
    const isPath = mazeData[coordinates.y][coordinates.x].isPath;

    //If the coordinate is next to player ubication (discarding diagonals)
    const isNextToPlayer =
      ((playerPosition.y + 1 === coordinates.y ||
        playerPosition.y - 1 === coordinates.y) &&
        playerPosition.x === coordinates.x) ||
      ((playerPosition.x + 1 === coordinates.x ||
        playerPosition.x - 1 === coordinates.x) &&
        playerPosition.y === coordinates.y);

    return isPath && isNextToPlayer;
  }

  function moveIfValid(id: string) {
    if (id) {
      const touchedCoordinate = getCoordinatesFromTileId(id);

      if (isValidTileToMove(touchedCoordinate)) {
        let newX = playerPosition.x;
        let dX = playerPosition.x - touchedCoordinate.x;

        let newY = playerPosition.y;
        let dY = playerPosition.y - touchedCoordinate.y;

        let newDirection = '' as React.SetStateAction<
          'right' | 'left' | 'down' | 'up'
        >;

        if (dX === 1) {
          newDirection = 'left';
          newX--;
        } else if (dX === -1) {
          newDirection = 'right';
          newX++;
        } else if (dY === 1) {
          newDirection = 'up';
          newY--;
        } else if (dY === -1) {
          newDirection = 'down';
          newY++;
        }

        setDirection(newDirection);

        movePlayer(newX, newY);
        // Update last cell coordinates
        setLastCellX(playerPosition.x);
        setLastCellY(playerPosition.y);
      }

      // setTouchedSquares([id]);
    }
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent screen scroll
    const touches = event.touches;
    const initialTouch = touches[0] as Touch;

    startTimerOnTap();

    const initialSquareId = getSquareIdFromTouch(initialTouch);

    if (!gameOverFlag) moveIfValid(initialSquareId!);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent screen scroll
    const touches = event.touches;

    // Calculate touchedSquares
    for (let i = 0; i < touches.length; i++) {
      const currentTouch = touches[i] as Touch;

      const tileId = getSquareIdFromTouch(currentTouch);

      if (!gameOverFlag && tileId) {
        moveIfValid(tileId);
      }
    }
  };

  const getSquareIdFromTouch = (touch: Touch) => {
    const square = document.elementFromPoint(touch.clientX, touch.clientY);

    // if (square?.id === 'player-icon') {
    //   return square.parentElement?.id;
    // }

    return square?.id || '';
  };

  return (
    <GameContext.Provider
      value={{
        mazeData,
        setMazeData,
        playerPosition,
        setPlayerPosition,
        score,
        setScore,
        gameOverFlag,
        setGameOverFlag,
        gameOverMessage,
        setGameOverMessage,
        timerStarted,
        setTimerStarted,
        direction,
        setDirection,
        selectedColorSet,
        setSelectedColorSet,
        lastCellX,
        setLastCellX,
        lastCellY,
        setLastCellY,
        hasPowerUp,
        setHasPowerUp,
        isPowerUpOn,
        setIsPowerUpOn,
        timeLimitInSeconds,
        setTimeLimitInSeconds,
        remainingTime,
        setRemainingTime,
        remainingMinutes,
        setRemainingMinutes,
        remainingSeconds,
        setRemainingSeconds,
        cheeseCooldown,
        setCheeseCooldown,
        bagCooldown,
        setBagCooldown,
        enemyCooldown,
        setEnemyCooldown,
        moves,
        setMoves,
        won,
        setWon,
        touchStart,
        setTouchStart,
        touchEnd,
        setTouchEnd,
        coveredCells,
        setCoveredCells,
        mazeRows,
        mazeCols,
        totalCells,
        startTimer,
        handleKeyPress,
        restartGame,
        calculateBlurRadius,
        handleTouchStart,
        handleTouchMove,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
