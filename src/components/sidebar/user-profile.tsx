'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Upload,
  Loader2,
  Palette, // Add this
  Check     // Add this
} from 'lucide-react';
import { useTubeTheme } from '@/contexts/tube-theme-context';

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
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("I'm on a mission to explore every single tube station in London! 🚇");
  const [tempBio, setTempBio] = useState(bio);
  
  // Profile picture states
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [tempProfilePic, setTempProfilePic] = useState<string | null>(null);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentTheme, setTheme, availableThemes } = useTubeTheme();

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
  ];

  // Camera functions
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = async () => {
    stopCamera();
    setIsCameraReady(false);
    
    try {
      setIsCameraMode(true);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 640, max: 1280 },
          aspectRatio: { ideal: 1 } // Square for profile picture
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ 
        title: "Camera Error", 
        description: "Could not access your camera. Please check permissions.", 
        variant: 'destructive' 
      });
      setIsCameraMode(false);
    }
  };

  const takeProfilePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make it square
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Calculate crop position for square center crop
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        // Mirror the image for better selfie experience
        ctx.scale(-1, 1);
        ctx.drawImage(video, -startX - size, startY, size, size, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setTempProfilePic(dataUrl);
        setIsCameraMode(false);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setTempProfilePic(result);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const saveProfilePicture = () => {
    if (tempProfilePic) {
      setProfilePicture(tempProfilePic);
      // TODO: Save to localStorage or blockchain
      localStorage.setItem('profilePicture', tempProfilePic);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully!",
        className: "bg-green-500 text-white"
      });
    }
    setIsProfilePicModalOpen(false);
    setTempProfilePic(null);
  };

  const cancelProfilePicture = () => {
    setTempProfilePic(null);
    setIsCameraMode(false);
    stopCamera();
    setIsProfilePicModalOpen(false);
  };

  // Load profile picture from localStorage on component mount
  useEffect(() => {
    const savedProfilePic = localStorage.getItem('profilePicture');
    if (savedProfilePic) {
      setProfilePicture(savedProfilePic);
    }
  }, []);

  // Other functions...
  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
    // TODO: Save to backend/blockchain
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  // Get current avatar source
  const currentAvatarSrc = profilePicture || 
    (publicKey ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${publicKey.toBase58()}` : `https://api.dicebear.com/8.x/pixel-art/svg`);

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="p-0">
          <div 
            className="flex items-center gap-4 cursor-pointer hover:bg-accent/10 p-2 rounded-lg transition-colors"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentAvatarSrc} alt="User Avatar" />
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
                  <AvatarImage src={currentAvatarSrc} alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => setIsProfilePicModalOpen(true)}
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

            {/* Add Theme Selection Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Tube Line Themes
                </CardTitle>
                <CardDescription>
                  Choose your favorite tube line theme. Complete lines to unlock new themes!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        currentTheme.id === theme.id 
                          ? 'border-primary shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      } ${!theme.unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => theme.unlocked && setTheme(theme.id)}
                      style={{
                        backgroundColor: theme.unlocked ? `${theme.color}15` : undefined
                      }}
                    >
                      {/* Theme color preview */}
                      <div 
                        className="w-full h-8 rounded mb-2"
                        style={{ 
                          backgroundColor: theme.color,
                          color: theme.textColor
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-xs font-semibold">
                          {theme.name}
                        </div>
                      </div>
                      
                      {/* Theme details */}
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{theme.displayName}</p>
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      </div>

                      {/* Selected indicator */}
                      {currentTheme.id === theme.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}

                      {/* Locked indicator */}
                      {!theme.unlocked && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                            🔒 Complete {theme.name} Line
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Current theme:</strong> {currentTheme.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentTheme.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Modal */}
      <Dialog open={isProfilePicModalOpen} onOpenChange={setIsProfilePicModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Update Profile Picture
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isCameraMode && !tempProfilePic && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how you'd like to update your profile picture
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={startCamera} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {isCameraMode && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Starting camera...</p>
                      </div>
                    </div>
                  )}
                  
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className={`w-full h-full object-cover scale-x-[-1] ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
                  />
                  
                  {/* Square crop overlay */}
                  {isCameraReady && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-white/50 rounded-full"></div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={cancelProfilePicture} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={takeProfilePhoto} disabled={!isCameraReady} className="flex-1">
                    📸 Take Photo
                  </Button>
                </div>
              </div>
            )}

            {tempProfilePic && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={tempProfilePic} alt="Profile Preview" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    How does this look?
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={cancelProfilePicture} className="flex-1">
                    Retake
                  </Button>
                  <Button onClick={saveProfilePicture} className="flex-1 bg-green-500 hover:bg-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
