import { getConfig } from '@/configs/config';
import { change, view } from '../contractUtils';
import { FinalExecutionOutcome, Wallet } from '@near-wallet-selector/core';
import { getNearSocial, setNearSocial } from '../socialCalls';

const { ecosystem, mazeVersion } = getConfig().socialKeys;

export interface KeysOptions {
  return_type: 'True' | 'BlockHeight' | 'NodeId';
  return_deleted: boolean;
  values_only: boolean;
}

export interface MazeData {
  cheddarEarned: number;
  score: number;
  path: number[];
}

export interface MazeMetadata {
  createdAt: Date;
  seedId: number;
}

export const getMazeData = async (accountId: string) => {
  const keys = [`${accountId}/index/${ecosystem}/${mazeVersion}/**`];
  return getNearSocial(keys);
};

export const setMazeData = async (
  wallet: Wallet,
  accountId: string,
  cheddarEarned: number,
  score: number,
  path: number[],
  createdAt: Date,
  seedId: number
) => {
  const data = {
    [accountId]: {
      index: {
        [ecosystem]: {
          key: mazeVersion,
          value: {
            data: {
              cheddarEarned,
              score,
              path,
            },
            metadata: {
              createdAt,
              seedId,
            },
          },
        },
      },
    },
  };

  return setNearSocial(wallet, data);
};
