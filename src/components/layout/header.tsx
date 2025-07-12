'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg text-primary">TubeHacks</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isMounted ? (
            <WalletMultiButton style={{}} />
          ) : (
            <Button className="w-[150px]">Loading...</Button>
          )}
        </div>
      </div>
    </header>
  );
}
