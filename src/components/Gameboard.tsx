import { MazeTileData } from '@/contexts/GameContextProvider';
import { useContext } from 'react';
import { GameContext } from '@/contexts/GameContextProvider';
import { ListItem, OrderedList } from '@chakra-ui/react';

import styles from '../styles/Gameboard.module.css';

interface Props {
  showRules: boolean;
  isUserLoggedIn: boolean;
  openLogIn: () => void;
}

export function Gameboard({ isUserLoggedIn, openLogIn, showRules }: Props) {
  const {
    mazeData,
    playerPosition,
    direction,
    selectedColorSet,
    lastCellX,
    setLastCellX,
    lastCellY,
    setLastCellY,
    calculateBlurRadius,
    handleTouchStart,
    handleTouchMove,
  } = useContext(GameContext);

  // Check if the game has started for the first time
  const gameStarted = playerPosition !== null;

  // Check if the player position has changed
  const playerMoved =
    gameStarted &&
    (lastCellX !== playerPosition.x || lastCellY !== playerPosition.y);

  // Update last player position
  setLastCellX(playerPosition!.x);
  setLastCellY(playerPosition!.y);

  function getPlayerImgDirection() {
    return styles[
      `playerMove${direction.charAt(0).toUpperCase() + direction.slice(1)}`
    ];
  }
  const handleConditionalFunction =
    (onTrue: (event: any) => void, onFalse: () => void) => (event: any) => {
      if (isUserLoggedIn) {
        onTrue(event);
      } else {
        onFalse();
      }
    };

  function getClassNamesForCell(cell: MazeTileData) {
    let backgroundColor;
    if (cell.isPath) {
      backgroundColor = 'pathColorSet';
    } else {
      backgroundColor = 'backgroundColorSet';
    }
    return `${styles.mazeCell} nonPathColorSet${selectedColorSet} ${backgroundColor}${selectedColorSet}`;
  }
  function getPlayerTileClasses(cell: MazeTileData) {
    let backgroundImage;
    if (cell.enemyWon || cell.hasCartel || cell.hasExit) {
      backgroundImage = 'playerBackgroundEmpty';
    } else {
      backgroundImage = 'playerBackgroundElementOnTop';
    }
    return `${styles.mazeCell} ${styles.playerCell} ${getPlayerImgDirection()} ${backgroundImage}`;
  }

  return (
    <>
      {showRules && (
        <div className={styles.orderedListContainer}>
          <OrderedList>
            <ListItem>Click or Tap to Start</ListItem>
            <ListItem>Navigate with Arrows or Tap</ListItem>
            <ListItem>Collect Cheddar🧀</ListItem>
            <ListItem>Battle Cartel to protect your Bag</ListItem>
            <ListItem>Find the Hidden Door🚪 to Win!</ListItem>
          </OrderedList>
        </div>
      )}
      {mazeData.map((row: MazeTileData[], rowIndex: number) => (
        <div key={rowIndex} className={styles.mazeRow}>
          {row.map((cell: MazeTileData, colIndex: number) => {
            const blurRadius = playerMoved
              ? calculateBlurRadius(colIndex, rowIndex)
              : 0;
            const applyBlur = blurRadius > 0; // Determine if blur should be applied
            // Define cell content based on cell type
            let cellContent = '';

            //TODO choose best logos options

            //====================================================== Start cheese logo options ======================================================
            if (cell.hasCheese) cellContent = '🧀';
            //====================================================== end cheese logo options ======================================================
            //====================================================== Start bag logo options ======================================================
            // else if(cell.hasBag) cellContent = '🤑';
            // else if(cell.hasBag) cellContent = '👑';
            // else if(cell.hasBag) cellContent = '💎';
            else if (cell.hasBag) cellContent = '💰';
            //====================================================== End bag logo options ======================================================
            //====================================================== Start enemy logo options ======================================================
            // else if (cell.hasEnemy) cellContent = '👾';
            // else if (cell.hasEnemy) cellContent = '👹';
            // else if (cell.hasEnemy) cellContent = '🤕';
            // else if (cell.hasEnemy) cellContent = '🤺';
            // else if (cell.hasEnemy) cellContent = '🦹‍♂️';
            // else if (cell.hasEnemy) cellContent = '🧌';
            // else if (cell.hasEnemy) cellContent = '🧙‍♂️';
            // else if (cell.hasEnemy) cellContent = '🤖';
            // else if (cell.hasEnemy) cellContent = '👽';
            // else if (cell.hasEnemy) cellContent = '👺';
            // else if (cell.hasEnemy) cellContent = '😈';
            // else if (cell.hasEnemy) cellContent = '🐉';
            else if (cell.hasEnemy) cellContent = '⚔️';
            //====================================================== End enemy logo options ======================================================
            //====================================================== Start exit logo options ======================================================
            else if (cell.hasExit) cellContent = '🚪';
            //====================================================== End exit logo options ======================================================
            //====================================================== Start cartel logo options ======================================================
            // else if (cell.hasCartel) cellContent = '👾';
            // else if (cell.hasCartel) cellContent = '🤮';
            // else if (cell.hasCartel) cellContent = '🤕';
            // else if (cell.hasCartel) cellContent = '💣';
            // else if (cell.hasCartel) cellContent = '💥';
            // else if (cell.hasCartel) cellContent = '🤺';
            // else if (cell.hasCartel) cellContent = '🧌';
            // else if (cell.hasCartel) cellContent = '🧙‍♂️';
            // else if (cell.hasCartel) cellContent = '🤖';
            // else if (cell.hasCartel) cellContent = '👽';
            // else if (cell.hasCartel) cellContent = '👺';
            // else if (cell.hasCartel) cellContent = '🦹‍♂️';
            // else if (cell.hasCartel) cellContent = '🐉';
            else if (cell.hasCartel) cellContent = '😈';
            //====================================================== End cartel logo options ======================================================
            //====================================================== Start enemy won logo options ======================================================
            // else if (cell.enemyWon) cellContent = '💢';
            // else if (cell.enemyWon) cellContent = '😵';
            // else if (cell.enemyWon) cellContent = '☠️';
            else if (cell.enemyWon) cellContent = '💀';
            //====================================================== End enemy won logo options ======================================================

            return (
              <div
                key={colIndex}
                id={`cell-${rowIndex}-${colIndex}`}
                className={getClassNamesForCell(cell)}
                style={{
                  filter: applyBlur ? `blur(${blurRadius}px)` : 'none', // Apply blur conditionally
                }}
                onClick={handleConditionalFunction(() => {}, openLogIn)}
                onTouchStart={handleConditionalFunction(
                  handleTouchStart,
                  openLogIn
                )}
                onTouchMove={handleConditionalFunction(
                  handleTouchMove,
                  () => {}
                )}
              >
                {/* Dynamic content based on cell */}
                {cellContent && (
                  <span
                    role="img"
                    aria-label={cellContent}
                    // className="static-icon"
                    className={styles.staticIcon}
                  >
                    {cellContent}
                  </span>
                )}

                {/* Player icon */}
                {playerPosition!.x === colIndex &&
                  playerPosition!.y === rowIndex && (
                    <div
                      className={getPlayerTileClasses(cell)}
                      // ${/*styles[direction]*/}
                    ></div>
                  )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
