"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { createFhevmInstance } from "../fhevm/fhevm";
import type { FhevmInstance } from "../fhevm/types";
import { useWallet } from "./useWallet";

interface FHEVMContextType {
  instance: FhevmInstance | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

export function FHEVMProvider({ children }: { children: ReactNode }) {
  const { provider, isConnected } = useWallet();
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (!provider || !isConnected) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      const fhevmInstance = await createFhevmInstance({
        provider,
        signal: controller.signal,
        onStatusChange: (status) => {
          console.log("FHEVM status:", status);
        },
      });

      setInstance(fhevmInstance);
    } catch (err) {
      console.error("Failed to initialize FHEVM:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize FHEVM");
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && !instance && !isLoading) {
      initialize();
    }
  }, [isConnected, instance, isLoading, initialize]);

  const value: FHEVMContextType = {
    instance,
    isLoading,
    error,
    initialize,
  };

  return <FHEVMContext.Provider value={value}>{children}</FHEVMContext.Provider>;
}

export function useFHEVM() {
  const context = useContext(FHEVMContext);
  if (context === undefined) {
    throw new Error("useFHEVM must be used within a FHEVMProvider");
  }
  return context;
}

