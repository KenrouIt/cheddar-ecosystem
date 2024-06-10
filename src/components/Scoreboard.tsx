import { useContext, useEffect, useRef, useState } from 'react';
import styles from '../styles/Scoreboard.module.css';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { getScoreBoard } from '@/queries/api/maze';
import { GameContext } from '@/contexts/GameContextProvider';
import { RenderCheddarIcon } from './RenderCheddarIcon';
import { PlusSquareIcon } from '@chakra-ui/icons';

export interface PlayerScoreData {
  accountId: string;
  score: number;
  cheddarEarned: number;
}

export const Scoreboard = () => {
  const { accountId } = useWalletSelector();
  const { scoreboardResponse } = useContext(GameContext);
  const [rowAmount, setRowAmount] = useState(4);

  const firstLoggedUserOccurrence = useRef(-1);

  function getRowStyles(index: number, playerScoreData: PlayerScoreData) {
    let rowStyles = `${styles.rowContainer} ${index === 0 ? '' : styles.borderTop} ${accountId === playerScoreData.accountId ? styles.userBackground : ''}`;

    return rowStyles;
  }

  function handleIncreaseElementsToShow() {
    setRowAmount(rowAmount + 5);
  }

  return (
    <>
      <table className={styles.tableContainer}>
        <thead className={styles.titlesContainer}>
          <tr>
            <th className={styles.th}>#</th>
            <th className={styles.th}>User</th>
            <th className={styles.th}>
              {RenderCheddarIcon({ width: '2rem' })}
            </th>
            <th className={styles.th}>Score</th>
          </tr>
        </thead>
        <tbody>
          {scoreboardResponse &&
            scoreboardResponse.ok &&
            scoreboardResponse.scoreboard.map((playerScoreData, index) => {
              if (
                firstLoggedUserOccurrence.current === -1 &&
                playerScoreData.accountId === accountId
              ) {
                firstLoggedUserOccurrence.current = index;
              }

              if (
                index > rowAmount &&
                firstLoggedUserOccurrence.current !== index
              )
                return <></>;
              return (
                <tr
                  key={`position-key-${index}`}
                  className={getRowStyles(index, playerScoreData)}
                >
                  <td
                    className={`${styles.content} ${styles.position}`}
                  >{`${index + 1}`}</td>
                  <td className={`${styles.content} ${styles.userName}`}>
                    {playerScoreData.accountId}
                  </td>
                  <td className={`${styles.content} ${styles.cheddarEarned}`}>
                    {playerScoreData.cheddarEarned}
                  </td>
                  <td className={`${styles.content} ${styles.score}`}>
                    {playerScoreData.score}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className={styles.tFoot}>
        <p className={styles.showMore} onClick={handleIncreaseElementsToShow}>
          <PlusSquareIcon />
        </p>
      </div>
    </>
  );
};
