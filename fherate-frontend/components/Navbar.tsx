"use client";

import Link from "next/link";
import { useWallet } from "../hooks/useWallet";

export function Navbar() {
  const { account, chainId, isConnected, connect, disconnect } = useWallet();

  const getNetworkName = (id: number | null) => {
    if (!id) return "Unknown";
    if (id === 31337) return "Localhost";
    if (id === 11155111) return "Sepolia";
    return `Chain ${id}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-xl font-bold">FR</span>
            </div>
            <span className="text-xl font-bold">FHERate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/browse" className="hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/create" className="hover:text-primary transition-colors">
              Create
            </Link>
            <Link href="/my-ratings" className="hover:text-primary transition-colors">
              My Ratings
            </Link>
            <Link href="/my-creations" className="hover:text-primary transition-colors">
              My Creations
            </Link>
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            {isConnected && chainId && (
              <div className="px-3 py-2 rounded-lg bg-white/10 text-sm">
                {getNetworkName(chainId)}
              </div>
            )}
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-sm">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connect} className="btn-primary text-sm">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

