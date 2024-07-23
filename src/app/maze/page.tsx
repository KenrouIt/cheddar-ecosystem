'use client';

import MazeContainer from '@/components/maze';
import { GameContextProvider } from '@/contexts/maze/GameContextProvider';

export default function Maze() {
  return (
    <GameContextProvider>
      <MazeContainer />
    </GameContextProvider>
  );
}
