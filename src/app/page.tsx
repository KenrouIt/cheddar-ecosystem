'use client';
import { useContext, useEffect, useState } from 'react';
import { GameboardContainer } from '../components/GameboardContainer';
import { GameContext } from '../contexts/GameContextProvider';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { CheddarToken } from '@/contracts/CheddarToken';
import { ntoy } from '@/contracts/contractUtils';
import { useGetCheddarBalance, useGetCheddarMetadata } from '@/hooks/cheddar';

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
  const [userCheddarBalance, setUserCheddarBalance] = useState<
    bigint | undefined | null
  >();
  const { data: cheddarBalanceData, isLoading: isLoadingCheddarBalance } =
    useGetCheddarBalance();
  const { data: cheddarMetadata, isLoading: isLoadingCheddarMetadata } =
    useGetCheddarMetadata();

  const [cheddarTokenImg, setCheddarTokenImg] = useState<undefined | string>();

  useEffect(() => {
    async function getCheddarBalance() {
      const wallet = await selector.wallet();
      const cheddarTokenContract = new CheddarToken(wallet);

      if (accountId) {
        const balance = await cheddarTokenContract.getBalance(accountId);
        setUserCheddarBalance(balance);

        const metadata = await cheddarTokenContract.getMetadata();
        setCheddarTokenImg(metadata.icon);
      } else {
        setUserCheddarBalance(null);
      }
    }

    getCheddarBalance();
  }, [accountId, selector]);

  const minCheddarRequired = ntoy(555);

  function doesUserHaveEnoughBalance() {
    if (!userCheddarBalance) return false;

    return minCheddarRequired <= userCheddarBalance!;
  }

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
      restartGame !== null
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
        />
      )}
    </div>
  );
}
