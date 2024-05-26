import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import {
  getCheddarBalance,
  getCheddarMetadata,
  getNFTs,
} from '@/contracts/cheddarCalls';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

// USE IN REACT COMPONENT
// const { data: cheddarBalanceData, isLoading: isLoadingCheddarBalance, refetch as void=> () } = useGetCheddarBalance();
export const useGetCheddarBalance = (): UseQueryResult => {
  const { accountId } = useWalletSelector();

  return useQuery({
    queryKey: ['useGetCheddarBalance', accountId],
    queryFn: () => (accountId ? getCheddarBalance(accountId) : null),
    refetchInterval: 10000,
    staleTime: 10000,
  });
};

// USE IN REACT COMPONENT
// const { data: cheddarMetadata, isLoading: isLoadingCheddarMetadata, refetch as void=> () } = useGetCheddarMetadata();
export const useGetCheddarMetadata = (): UseQueryResult => {
  return useQuery({
    queryKey: ['useGetCheddarMetadata'],
    queryFn: () => getCheddarMetadata(),
    refetchInterval: Infinity,
    staleTime: Infinity,
  });
};

// USE IN REACT COMPONENT
// const { data: cheddarNFTsData, isLoading: isLoadingCheddarNFTs, refetch as void=> () } = useGetCheddarNFTs();
export const useGetCheddarNFTs = (): UseQueryResult => {
  const { accountId } = useWalletSelector();

  return useQuery({
    queryKey: ['useGetCheddarNFTs', accountId],
    queryFn: () => (accountId ? getNFTs(accountId) : null),
    refetchInterval: 10000,
    staleTime: 10000,
  });
};
