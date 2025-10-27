"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BrowserProvider, Eip1193Provider } from "ethers";

interface WalletState {
  account: string | null;
  chainId: number | null;
  provider: Eip1193Provider | null;
  isConnected: boolean;
  isConnecting: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  getSigner: () => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONNECTED: "wallet.connected",
  LAST_ACCOUNT: "wallet.lastAccounts",
  LAST_CHAIN_ID: "wallet.lastChainId",
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    account: null,
    chainId: null,
    provider: null,
    isConnected: false,
    isConnecting: false,
  });

  const updateState = useCallback((updates: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const disconnect = useCallback(() => {
    updateState({
      account: null,
      chainId: null,
      provider: null,
      isConnected: false,
    });
    localStorage.removeItem(STORAGE_KEYS.CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNT);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHAIN_ID);
  }, [updateState]);

  const setupEventListeners = useCallback(
    (provider: any) => {
      if (!provider.on) return;
      
      provider.on("accountsChanged", (accounts: string[]) => {
        console.log("accountsChanged", accounts);
        if (accounts.length === 0) {
          disconnect();
        } else {
          updateState({ account: accounts[0] });
          localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, accounts[0]);
        }
      });

      provider.on("chainChanged", (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        console.log("chainChanged", newChainId);
        updateState({ chainId: newChainId });
        localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, newChainId.toString());
        // Reload page on chain change for safety
        window.location.reload();
      });

      provider.on("disconnect", () => {
        console.log("Provider disconnected");
        disconnect();
      });
    },
    [disconnect, updateState]
  );

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    try {
      updateState({ isConnecting: true });

      const provider = window.ethereum as Eip1193Provider;
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const chainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      updateState({
        account: accounts[0],
        chainId,
        provider,
        isConnected: true,
        isConnecting: false,
      });

      // Persist connection
      localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
      localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, accounts[0]);
      localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, chainId.toString());

      setupEventListeners(provider);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      updateState({ isConnecting: false });
      throw error;
    }
  }, [setupEventListeners, updateState]);

  const getSigner = useCallback(async () => {
    if (!state.provider) {
      throw new Error("Wallet not connected");
    }
    const browserProvider = new BrowserProvider(state.provider);
    return await browserProvider.getSigner();
  }, [state.provider]);

  // Auto-reconnect on mount
  useEffect(() => {
    const autoReconnect = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        return;
      }

      const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === "true";
      if (!wasConnected) {
        return;
      }

      try {
        const provider = window.ethereum as Eip1193Provider;
        
        // Silent reconnect using eth_accounts
        const accounts = (await provider.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts.length === 0) {
          disconnect();
          return;
        }

        const chainIdHex = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const chainId = parseInt(chainIdHex, 16);

        updateState({
          account: accounts[0],
          chainId,
          provider,
          isConnected: true,
        });

        setupEventListeners(provider);
      } catch (error) {
        console.error("Auto-reconnect failed:", error);
        disconnect();
      }
    };

    autoReconnect();
  }, [disconnect, setupEventListeners, updateState]);

  const value: WalletContextType = {
    ...state,
    connect,
    disconnect,
    getSigner,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

