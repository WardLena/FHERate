import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "FHERate - Privacy-Preserving Rating Platform",
  description: "Decentralized multi-dimensional rating system powered by FHEVM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

