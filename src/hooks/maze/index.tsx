import { PlayerScoreData } from '@/components/maze/Scoreboard';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import {
  isAllowed as isAllowedResponse,
  getSeedId,
  getPendingCheddarToMint,
  getScoreBoard,
} from '@/queries/maze/api';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export interface IsAllowedResponse {
  ok: boolean;
  errors?: string[];
}

export interface ScoreboardResponse {
  ok: boolean;
  scoreboard: PlayerScoreData[];
}

export const useGetIsAllowedResponse =
  (): UseQueryResult<null | IsAllowedResponse> => {
    const { accountId } = useWalletSelector();

    return useQuery({
      queryKey: ['useGetIsAllowed', accountId],
      queryFn: () => (accountId ? isAllowedResponse(accountId) : null),
      refetchInterval: 10000,
      staleTime: 10000,
    });
  };

export const useGetScoreboard =
  (): UseQueryResult<null | ScoreboardResponse> => {
    return useQuery({
      queryKey: ['useGetScoreboard'],
      queryFn: () => getScoreBoard(),
      refetchInterval: 10000,
      staleTime: 10000,
    });
  };

export const useGetPendingCheddarToMint = (): UseQueryResult<number> => {
  const { accountId } = useWalletSelector();

  return useQuery({
    queryKey: ['useGetPendingCheddarToMint', accountId],
    queryFn: () => (accountId ? getPendingCheddarToMint(accountId) : null),
    refetchInterval: 10000,
    staleTime: 10000,
  });
};
