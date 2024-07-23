import React, { useCallback, useContext, useEffect, useState } from 'react';
import { map, distinctUntilChanged } from 'rxjs';
import {
  NetworkId,
  setupWalletSelector,
  Wallet,
} from '@near-wallet-selector/core';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import { store } from '@/stores/walletSelector.store';
import { getConfig } from '@/configs/config';

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
    account_id: string | null;
    wallet: Wallet | null;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

enum Wallets {
  Here = 'here',
  Meteor = 'meteor',
  MyNearWallet = 'mynearwallet',
  MintBase = 'mintbase',
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: any = ({ children }: any) => {
  const { networkData } = getConfig();

  const NETWORK_ID = networkData.networkId;
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const DEFAULT_ENABLE_WALLETS = ['mynearwallet', 'meteor', 'here', 'mintbase'];

  const setupWallets = useCallback(() => {
    let modules: any[] = [];
    const enableWallets = DEFAULT_ENABLE_WALLETS;
    enableWallets.forEach((w: string) => {
      switch (w) {
        case Wallets.Meteor: {
          modules.push(setupMeteorWallet());
          break;
        }
        case Wallets.MyNearWallet: {
          modules.push(setupMyNearWallet());
          break;
        }
        case Wallets.Here: {
          modules.push(setupHereWallet());
          break;
        }
        case Wallets.MintBase: {
          modules.push(setupMintbaseWallet());
          break;
        }
      }
    });
    return modules;
  }, [DEFAULT_ENABLE_WALLETS, NETWORK_ID]);

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: {
        networkId: networkData.networkId,
        nodeUrl: networkData.nodeUrl,
        helperUrl: networkData.helperUrl,
        explorerUrl: networkData.explorerUrl,
        indexerUrl: networkData.indexerUrl,
      },
      debug: true,
      modules: setupWallets(),
    });

    const _modal = setupModal(_selector, {
      contractId: '',
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    store.setState({
      selector: _selector,
      modal: _modal,
      account_id: _selector.isSignedIn()
        ? _selector.store.getState().accounts.find((account) => account.active)
            ?.accountId || null
        : null,
      wallet: _selector.isSignedIn() ? await _selector.wallet() : null,
    });

    // keep window global variables
    window.selector = _selector;
    window.modal = _modal;
    window.account_id = _selector.isSignedIn()
      ? _selector.store.getState().accounts.find((account) => account.active)
          ?.accountId || null
      : null;
    window.wallet = _selector.isSignedIn() ? await _selector.wallet() : null;

    setSelector(_selector);
    setModal(_modal);
  }, [NETWORK_ID, setupWallets]);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert('Failed to initialise wallet selector');
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts), // If breaks, update rxjs
        distinctUntilChanged()
      )
      .subscribe(async (nextAccounts) => {
        const wallet = selector.isSignedIn() ? await selector.wallet() : null;
        setAccounts(nextAccounts);
        store.setState((prev) => ({
          modal: modal,
          selector: selector,
          wallet: wallet,
          account_id: nextAccounts.find(
            (account: AccountState) => account.active
          )?.accountId!,
        }));
        // keep window global VARIABLES
        window.account_id = nextAccounts.find(
          (account: AccountState) => account.active
        )?.accountId!;
      });

    return () => subscription.unsubscribe();
  }, [selector, modal]);

  if (!selector || !modal) {
    return null;
  }

  const accountId =
    accounts.find((account) => account.active)?.accountId || null;

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      'useWalletSelector must be used within a WalletSelectorContextProvider'
    );
  }

  return context;
}
