'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  getAllUserAchievements, 
  getProgressToNextAchievement,
  type Achievement,
  ACHIEVEMENT_MILESTONES
} from '@/lib/achievements-system';
import { useToast } from '@/hooks/use-toast';
import AchievementNotification from '@/components/ui/achievement-notification';

export default function Achievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState({ current: 0, next: 0, progress: 0 });
  const [notificationAchievement, setNotificationAchievement] = useState<Achievement | null>(null);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Load shown achievements from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shownAchievements');
      if (stored) {
        setShownAchievements(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading shown achievements:', error);
    }
  }, []);
  
  // Refresh achievements from localStorage
  const refreshAchievements = () => {
    setAchievements(getAllUserAchievements());
    setProgress(getProgressToNextAchievement());
  };
  
  // Load achievements on mount and set up interval to check for updates
  useEffect(() => {
    refreshAchievements();
    
    // Set up interval to check for new achievements (in case they're added from other components)
    const interval = setInterval(refreshAchievements, 500); // More frequent updates
    
    return () => clearInterval(interval);
  }, []);
  
  // Listen for achievement-unlocked event
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && e.detail.achievements && e.detail.achievements.length > 0) {
        const latestAchievement = e.detail.achievements[e.detail.achievements.length - 1];
        if (!shownAchievements.has(latestAchievement.id)) {
          setNotificationAchievement(latestAchievement);
          const newShownAchievements = new Set([...shownAchievements, latestAchievement.id]);
          setShownAchievements(newShownAchievements);
          // Save to localStorage
          localStorage.setItem('shownAchievements', JSON.stringify([...newShownAchievements]));
        }
      }
    };
    window.addEventListener('achievement-unlocked', handler);
    return () => window.removeEventListener('achievement-unlocked', handler);
  }, [shownAchievements]);
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDetailModalOpen(true);
  };
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
      className: "bg-green-500 text-white"
    });
  };
  
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
  
  return (
    <div className="space-y-4">
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progress to Next Achievement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Current: {progress.current} stations</span>
            <span>Next: {progress.next} stations</span>
          </div>
          <Progress value={progress.progress} className="w-full" />
          <div className="text-xs text-muted-foreground">
            {progress.progress.toFixed(1)}% complete
          </div>
        </CardContent>
      </Card>
      
      {/* Achievements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements ({achievements.length}/{ACHIEVEMENT_MILESTONES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements unlocked yet</p>
              <p className="text-sm">Visit tube stations to start earning achievements!</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const rarity = achievement.metadata.attributes.find(
                    attr => attr.trait_type === 'Rarity'
                  )?.value || 'Common';
                  
                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      <div className="relative">
                        <img
                          src={achievement.metadata.image}
                          alt={achievement.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className={`absolute -top-1 -right-1 p-1 rounded-full ${getRarityColor(rarity)}`}>
                          {getRarityIcon(rarity)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {achievement.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {achievement.description}
                        </p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground">
                            Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {/* Achievement Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedAchievement.metadata.image}
                  alt={selectedAchievement.name}
                  className="w-32 h-32 mx-auto rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedAchievement.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAchievement.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedAchievement.requiredVisits} stations
                  </Badge>
                  <Badge variant="outline">
                    {selectedAchievement.metadata.attributes.find(
                      attr => attr.trait_type === 'Rarity'
                    )?.value || 'Common'}
                  </Badge>
                </div>
                
                {selectedAchievement.unlockedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Unlocked {format(new Date(selectedAchievement.unlockedAt), 'PPP')}
                  </div>
                )}
                
                {selectedAchievement.tokenMint && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Token Mint:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAchievement.tokenMint!, 'Token mint address')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {selectedAchievement.tokenMint}
                    </code>
                  </div>
                )}
                
                {selectedAchievement.transactionSignature && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Transaction:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAchievement.transactionSignature!, 'Transaction signature')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {selectedAchievement.transactionSignature}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Achievement Notification */}
      {notificationAchievement && (
        <AchievementNotification
          achievement={notificationAchievement}
          onClose={() => setNotificationAchievement(null)}
        />
      )}
    </div>
  );
} 