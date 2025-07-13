'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X 
} from 'lucide-react';

interface UserProfileProps {
  collectedBadges: string[];
}

// Mock data structure for visit log (we'll implement this later)
interface VisitLog {
  stationName: string;
  timestamp: Date;
  verified: boolean;
}

export default function UserProfile({ collectedBadges }: UserProfileProps) {
  const { publicKey, connected } = useWallet();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("I'm on a mission to explore every single tube station in London! 🚇");
  const [tempBio, setTempBio] = useState(bio);

  const formattedBadges = collectedBadges.map(stationId => 
    stationId
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('and', ' & ')
  );

  // Mock data for demonstration (we'll implement this later)
  const totalStations = 272; // Total London tube stations
  const visitedStations = collectedBadges.length;
  const explorationPercentage = Math.round((visitedStations / totalStations) * 100);

  // Mock visit log (we'll implement this later)
  const visitLog: VisitLog[] = [
    { stationName: 'Victoria', timestamp: new Date('2024-01-15T10:30:00'), verified: true },
    { stationName: 'Pimlico', timestamp: new Date('2024-01-15T11:45:00'), verified: true },
    // Add more mock data as needed
  ];

  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
    // TODO: Save to backend/blockchain
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="p-0">
          <div 
            className="flex items-center gap-4 cursor-pointer hover:bg-accent/10 p-2 rounded-lg transition-colors"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={publicKey ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${publicKey.toBase58()}` : `https://api.dicebear.com/8.x/pixel-art/svg`}
                alt="User Avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-headline">{connected ? 'Wallet Connected' : 'Connect Wallet'}</CardTitle>
              <CardDescription className="w-48 truncate text-xs">
                {publicKey ? publicKey.toBase58() : 'No wallet connected'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-md">
            <Ticket className="w-5 h-5 text-primary" /> Collected Badges ({collectedBadges.length})
          </h3>
          <ScrollArea className="h-40 rounded-md border p-3">
            <div className="flex flex-wrap gap-2">
              {collectedBadges.length > 0 ? (
                formattedBadges.map(stationName => (
                  <Badge key={stationName} variant="secondary" className="capitalize text-sm bg-accent/20 text-accent-foreground border-accent/30">
                    {stationName}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">No badges collected yet. Visit a station to start!</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={publicKey ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${publicKey.toBase58()}` : `https://api.dicebear.com/8.x/pixel-art/svg`}
                    alt="User Avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => {
                    // TODO: Implement profile picture upload
                    console.log('Upload profile picture');
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-semibold">Explorer</h3>
                <p className="text-sm text-muted-foreground">
                  {publicKey ? publicKey.toBase58().slice(0, 20) + '...' : 'No wallet connected'}
                </p>
              </div>
            </div>

            {/* Exploration Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Exploration Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {visitedStations} of {totalStations} stations visited
                  </span>
                  <Badge variant="outline" className="text-primary">
                    {explorationPercentage}%
                  </Badge>
                </div>
                <Progress value={explorationPercentage} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{visitedStations}</p>
                    <p className="text-xs text-muted-foreground">Visited</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-500">{totalStations - visitedStations}</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{Math.round(explorationPercentage)}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Visit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  {visitLog.length > 0 ? (
                    <div className="space-y-3">
                      {visitLog.map((visit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${visit.verified ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div>
                              <p className="font-medium text-sm">{visit.stationName}</p>
                              <p className="text-xs text-muted-foreground">
                                {visit.timestamp.toLocaleDateString()} at {visit.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={visit.verified ? "default" : "secondary"} className="text-xs">
                            {visit.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No station visits yet. Start exploring!
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    My Journey
                  </div>
                  {!isEditingBio && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditingBio(true)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingBio ? (
                  <div className="space-y-3">
                    <Textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Why do you want to visit every tube station?"
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveBio}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelBio}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {bio}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
