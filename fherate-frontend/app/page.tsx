"use client";

import Link from "next/link";
import { Shield, Star, Lock, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          FHERate
        </h1>
        <p className="text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
          Privacy-Preserving Multi-Dimensional Rating Platform
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/create" className="btn-primary">
            Create Rating Activity
          </Link>
          <Link href="/browse" className="btn-secondary">
            Browse Activities
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why FHERate?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy Protected</h3>
            <p className="text-white/70">
              Ratings encrypted on-chain using FHEVM technology
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Dimensional</h3>
            <p className="text-white/70">
              Rate products across multiple customizable dimensions
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
            <p className="text-white/70">
              No central authority, powered by blockchain
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent Stats</h3>
            <p className="text-white/70">
              View decrypted statistics with creator authorization
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xl font-bold">
              1
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Create Activity</h3>
              <p className="text-white/70">
                Set up a rating activity with custom dimensions, scale, and deadline
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xl font-bold">
              2
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Submit Encrypted Ratings</h3>
              <p className="text-white/70">
                Participants rate each dimension privately using FHE encryption
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-xl font-bold">
              3
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Decrypt & Analyze</h3>
              <p className="text-white/70">
                Creators decrypt statistics to view aggregated results and insights
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

