'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trophy, Star, ExternalLink } from 'lucide-react';
import { type Achievement } from '@/lib/achievements-system';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation sequence
    setIsVisible(true);
    setIsAnimating(true);
    
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarity = achievement.metadata.attributes.find(
    attr => attr.trait_type === 'Rarity'
  )?.value || 'Common';

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Uncommon': return 'bg-green-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      case 'Mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Mythic': return <Star className="w-4 h-4" />;
      case 'Legendary': return <Star className="w-4 h-4" />;
      case 'Epic': return <Star className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className={`w-80 shadow-lg border-2 transition-all duration-300 ${
        isAnimating ? 'scale-105' : 'scale-100'
      }`} style={{
        borderColor: rarity === 'Mythic' ? '#EF4444' : 
                    rarity === 'Legendary' ? '#F59E0B' : 
                    rarity === 'Epic' ? '#8B5CF6' : 
                    rarity === 'Rare' ? '#3B82F6' : 
                    rarity === 'Uncommon' ? '#10B981' : '#6B7280'
      }}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Achievement Icon */}
            <div className="relative flex-shrink-0">
              <img
                src={achievement.metadata.image}
                alt={achievement.name}
                className="w-16 h-16 rounded-lg"
              />
              <div className={`absolute -top-1 -right-1 p-1 rounded-full ${getRarityColor(rarity)}`}>
                {getRarityIcon(rarity)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-primary">
                  🏆 Achievement Unlocked!
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAnimating(false);
                    setTimeout(() => {
                      setIsVisible(false);
                      setTimeout(onClose, 300);
                    }, 300);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <h4 className="font-semibold text-base mb-1">
                {achievement.name}
              </h4>
              
              <p className="text-sm text-muted-foreground mb-2">
                {achievement.description}
              </p>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {achievement.requiredVisits} stations
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {rarity}
                </Badge>
              </div>
            </div>
          </div>

          {/* Sparkle effect for rare achievements */}
          {rarity === 'Mythic' || rarity === 'Legendary' ? (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2 animate-pulse">
                <Star className="w-3 h-3 text-yellow-400" />
              </div>
              <div className="absolute bottom-2 left-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Star className="w-3 h-3 text-yellow-400" />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 