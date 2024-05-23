'use client';
import { useContext, useEffect, useState } from 'react';
import { GameboardContainer } from '../components/GameboardContainer';
import { GameContext } from '../contexts/GameContextProvider';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { CheddarToken } from '@/contracts/CheddarToken';
import { ntoy } from '@/contracts/contractUtils';
import { useGetCheddarBalance, useGetCheddarMetadata } from '@/hooks/cheddar';
import { useGetIsAllowedResponse as useGetIsAllowedResponse } from '@/hooks/maze';
import { isAllowed } from '@/queries/api/maze';

export default function Home() {
  const {
    mazeData,
    playerPosition,
    score,
    gameOverFlag,
    gameOverMessage,
    selectedColorSet,
    isPowerUpOn,
    setIsPowerUpOn,
    remainingTime,
    startTimer,
    handleKeyPress,
    handleTouchMove,
    restartGame,
  } = useContext(GameContext);

  const { selector, accountId } = useWalletSelector();

  const { data: cheddarMetadata, isLoading: isLoadingCheddarMetadata } =
    useGetCheddarMetadata();
  const { data: cheddarBalanceData, isLoading: isLoadingCheddarBalance } =
    useGetCheddarBalance();
  const { data: isAllowedResponse, isLoading: isLoadingIsAllowed } =
    useGetIsAllowedResponse();

  const [queriesLoaded, setQueriesLoaded] = useState(false);

  if (!queriesLoaded) {
    if (
      !isLoadingCheddarBalance &&
      !isLoadingCheddarMetadata &&
      !isLoadingIsAllowed
    ) {
      setQueriesLoaded(true);
    }
  }

  const minCheddarRequired = ntoy(555);

  function doesUserHaveEnoughBalance() {
    if (!cheddarBalanceData) return false;

    return minCheddarRequired <= cheddarBalanceData!;
  }

  let haveEnoughBalance = false;
  useEffect(() => {
    haveEnoughBalance = doesUserHaveEnoughBalance();
  }, [cheddarBalanceData, accountId, selector, isAllowedResponse]);

  function handlePowerUpClick() {
    setIsPowerUpOn(!isPowerUpOn);
    // Additional logic if needed
  }

  function isMobile() {
    const userAgent = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  }

  const cellSize = isMobile() ? 30 : 40;

  function getMinRequiredWithTwoDecimals() {
    const biToString = Number(BigInt(minCheddarRequired)).toString();

    let dotPosition;
    for (let index = 0; index < biToString.length; index++) {
      if (biToString[index] === '.') {
        dotPosition = index;
      }
    }

    let stringWithTwoDecimals;
    if (dotPosition) {
      stringWithTwoDecimals = biToString.slice(0, dotPosition + 3);
    } else {
      stringWithTwoDecimals = biToString;
    }

    return Number(stringWithTwoDecimals);
  }

  function initialized() {
    // Check if all necessary state variables are not null or undefined
    return (
      selectedColorSet !== null &&
      mazeData !== null &&
      Array.isArray(mazeData) &&
      mazeData[0] !== undefined &&
      playerPosition !== null &&
      score !== null &&
      remainingTime !== null &&
      gameOverFlag !== null &&
      gameOverMessage !== null &&
      startTimer !== null &&
      handleKeyPress !== null &&
      handleTouchMove !== null &&
      restartGame !== null &&
      isAllowedResponse
    );
  }

  return (
    <div>
      {initialized() && ( // Replace `condition` with your actual condition
        <GameboardContainer
          remainingMinutes={Math.floor(remainingTime / 60)}
          remainingSeconds={remainingTime % 60}
          handlePowerUpClick={handlePowerUpClick}
          cellSize={cellSize}
          haveEnoughBalance={haveEnoughBalance}
          minCheddarRequired={getMinRequiredWithTwoDecimals()}
          isAllowedResponse={isAllowedResponse}
        />
      )}
    </div>
  );
}
