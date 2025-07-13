'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Sparkles, 
  Trophy,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type StationToken } from '@/lib/token-system';

interface TokenMintCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  token: StationToken | null;
}

export default function TokenMintCelebration({ isOpen, onClose, token }: TokenMintCelebrationProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isOpen && token) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const runConfetti = () => {
        // More subtle and spread out confetti
        confetti({
          angle: randomInRange(45, 135), // Wider angle range
          spread: randomInRange(80, 120), // Much wider spread
          particleCount: randomInRange(20, 40), // Fewer particles per burst
          origin: { y: 0.7 }, // Slightly lower origin
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
          scalar: randomInRange(0.8, 1.2), // Vary particle sizes
          gravity: 0.6, // Slower fall
          drift: randomInRange(-0.5, 0.5) // Add some sideways drift
        });

        // Less frequent bursts for subtlety
        setTimeout(() => {
          if (Date.now() < animationEnd) {
            requestAnimationFrame(runConfetti);
          }
        }, randomInRange(150, 300)); // Pause between bursts
      };

      // Start confetti
      runConfetti();

      // Animation sequence
      const timer1 = setTimeout(() => setAnimationStep(1), 500);
      const timer2 = setTimeout(() => setAnimationStep(2), 1000);
      const timer3 = setTimeout(() => setAnimationStep(3), 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, token]);

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="text-center space-y-6 py-6">
          {/* Title with animation */}
          <div className={`transform transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Coins className="w-16 h-16 text-yellow-500 animate-bounce" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
              🎉 Token Minted! 🎉
            </DialogTitle>
            <p className="text-yellow-600 dark:text-yellow-400">
              Congratulations! You've earned a unique station token!
            </p>
          </div>

          {/* Token Preview with animation */}
          <div className={`transform transition-all duration-1000 delay-500 ${animationStep >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-180'}`}>
            <div className="relative mx-auto w-40 h-40 rounded-xl overflow-hidden border-4 border-yellow-400 shadow-2xl">
              <img
                src={token.metadata.image}
                alt={token.metadata.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <Badge variant="default" className="w-full justify-center bg-yellow-500 text-yellow-900 font-bold">
                  ✓ VERIFIED
                </Badge>
              </div>
            </div>
          </div>

          {/* Token Details with animation */}
          <div className={`transform transition-all duration-1000 delay-1000 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-lg">{token.metadata.name}</h3>
              <p className="text-sm text-muted-foreground">
                {token.stationName} • {token.metadata.attributes.find(attr => attr.trait_type === 'Primary Line')?.value}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Minted Successfully
              </div>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className={`transform transition-all duration-1000 delay-1500 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full mx-auto inline-flex items-center gap-2 font-bold">
              <Trophy className="w-5 h-5" />
              Explorer Achievement Unlocked!
            </div>
          </div>

          {/* Action Button */}
          <div className={`transform transition-all duration-1000 delay-2000 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button 
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold px-8 py-2 rounded-full"
            >
              View in Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 