"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Rocket, Map } from "lucide-react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg text-primary">
              Tubler
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  pathname === "/" && "bg-primary text-primary-foreground"
                )}
              >
                <Map className="h-4 w-4" />
                Map
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                <Link href="/">
                  <Button
                    variant={pathname === "/" ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === "/" && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Map className="mr-2 h-4 w-4" /> Map
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

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
