"use client";

import { WalletProvider } from "../hooks/useWallet";
import { FHEVMProvider } from "../hooks/useFHEVM";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <FHEVMProvider>
        {children}
      </FHEVMProvider>
    </WalletProvider>
  );
}

