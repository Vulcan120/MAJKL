'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { verifyStationImageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { orderByDistance } from 'geolib';
import stationCoordinates from '@/lib/station-coordinates.json';
import { saveStationPhoto } from '@/lib/utils';

const VerificationSchema = z.object({
  stationName: z.string().min(1, 'Please select a station'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(15, 'Username cannot exceed 15 characters').startsWith('@', 'Username must start with @'),
});

interface StationVerificationProps {
  onStationVerified: (stationName: string) => void;
  allStations: string[];
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface StationWithDistance {
  name: string;
  distance: number;
}

const VerificationCircle = ({ 
  progress, 
  status, 
  isSuccess, 
  isFailed 
}: { 
  progress: number; 
  status: string; 
  isSuccess: boolean; 
  isFailed: boolean; 
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-3 py-4">
      <div className="relative">
        <svg 
          width="100" 
          height="100" 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Animated progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ease-out ${
              isSuccess ? 'text-green-500' : 
              isFailed ? 'text-red-500' : 
              'text-blue-500'
            }`}
            style={{
              strokeLinecap: 'round',
              transform: isFailed ? 'scale(0.8)' : 'scale(1)',
              opacity: isFailed ? 0.5 : 1,
            }}
          />
        </svg>
        
        {/* Center icon/content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isSuccess && !isFailed && (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full mx-auto"></div>
              </div>
            </div>
          )}
          
          {isSuccess && (
            <CheckCircle size={24} className="text-green-500 animate-in zoom-in duration-300" />
          )}
          
          {isFailed && (
            <XCircle size={24} className="text-red-500 animate-in zoom-in duration-300" />
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center animate-in fade-in duration-200">
        {status}
      </p>
    </div>
  );
};

export default function StationVerification({ onStationVerified, allStations }: StationVerificationProps) {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Location-based functionality
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyStations, setNearbyStations] = useState<StationWithDistance[]>([]);

  const form = useForm<z.infer<typeof VerificationSchema>>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: { stationName: '', username: '' },
  });

  // Get user's location
  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000 // 10 minutes
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setUserLocation(location);
      calculateNearbyStations(location);
      toast({ 
        title: "Location found", 
        description: "Showing nearby stations first", 
        className: 'bg-green-500 text-white' 
      });
    } catch (error) {
      const err = error as GeolocationPositionError;
      let message = "Could not get your location.";
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = "Location access denied. Please enable location permissions.";
          break;
        case err.POSITION_UNAVAILABLE:
          message = "Location information unavailable.";
          break;
        case err.TIMEOUT:
          message = "Location request timed out.";
          break;
      }
      
      setLocationError(message);
      toast({ 
        title: "Location Error", 
        description: message, 
        variant: 'destructive' 
      });
    } finally {
      setLocationLoading(false);
    }
  }, [toast]);

  // Calculate nearby stations
  const calculateNearbyStations = useCallback((location: UserLocation) => {
    const stationsWithCoords = allStations
      .map(station => {
        const coords = stationCoordinates[station as keyof typeof stationCoordinates];
        if (!coords) return null;
        
        return {
          name: station,
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      })
      .filter((station): station is NonNullable<typeof station> => station !== null);

    if (stationsWithCoords.length === 0) return;

    // Use geolib to calculate distances and sort by proximity
    const sortedStations = orderByDistance(
      { latitude: location.latitude, longitude: location.longitude },
      stationsWithCoords
    );

    const nearbyStationsWithDistance = sortedStations.slice(0, 10).map((station) => ({
      name: (station as any).name,
      distance: Math.round((station as any).distance || 0) // geolib adds distance property
    }));

    setNearbyStations(nearbyStationsWithDistance);
  }, [allStations]);

  // Get organized station list (nearby first, then alphabetical)
  const getOrganizedStations = useCallback(() => {
    if (nearbyStations.length === 0) {
      return allStations.sort();
    }

    const nearbyStationNames = nearbyStations.map(s => s.name);
    const otherStations = allStations
      .filter(station => !nearbyStationNames.includes(station))
      .sort();

    return [...nearbyStations.map(s => s.name), ...otherStations];
  }, [allStations, nearbyStations]);

  // Format distance for display
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };
  
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
      // Open modal first
      setIsCameraOpen(true);
      
      // Enhanced camera constraints for better cross-device compatibility
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // Front camera for selfies
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setIsCameraOpen(false); // Close modal on error
      toast({ 
        title: "Camera Error", 
        description: "Could not access your camera. Please check permissions and try again.", 
        variant: 'destructive' 
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Use the video's actual dimensions for better quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image for better selfie experience
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        // Convert to data URL with good quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoDataUri(dataUrl);
        setIsCameraOpen(false);
        stopCamera();
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof VerificationSchema>) => {
    if (!photoDataUri) {
      toast({ title: "No Photo", description: "Please take a photo to submit.", variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setVerificationProgress(0);
    setVerificationStatus('Initializing verification...');
    
    try {
      // Progress animation sequence
      setVerificationProgress(15);
      setVerificationStatus('Sending image to AI...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setVerificationProgress(35);
      setVerificationStatus('Analyzing image authenticity...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setVerificationProgress(60);
      setVerificationStatus('Checking station signs...');
      
      const result = await verifyStationImageAction({
        photoDataUri,
        stationName: data.stationName,
        username: data.username,
        userLocation: userLocation || undefined,
      });
      
      setVerificationProgress(85);
      setVerificationStatus('Verifying username...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVerificationProgress(100);
      
      if (result.isAuthentic) {
        setVerificationStatus('✅ Station verified successfully!');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Show success state
        
        // Save verification photo to localStorage
        if (photoDataUri) {
          saveStationPhoto(data.stationName, photoDataUri, 'verification');
        }
        
        toast({ 
          title: `🎉 Verified!`, 
          description: `${data.stationName} station confirmed!`, 
          className: 'bg-green-500 text-white' 
        });
        onStationVerified(data.stationName);
        form.reset();
        setPhotoDataUri(null);
      } else {
        setVerificationStatus('❌ Verification failed');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Show failure state
        
        toast({ 
          title: "❌ Verification Failed", 
          description: result.verificationResult.slice(0, 100) + "...", 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      setVerificationProgress(0);
      setVerificationStatus('💥 Verification error occurred');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred during verification.", 
        variant: 'destructive' 
      });
    } finally {
      // Reset after a delay
      setTimeout(() => {
        setIsLoading(false);
        setVerificationProgress(0);
        setVerificationStatus('');
      }, 1500);
    }
  };

  // Dev-only function that bypasses verification and always succeeds
  const onDevSubmit = async (data: z.infer<typeof VerificationSchema>) => {
    if (!photoDataUri) {
      toast({ title: "No Photo", description: "Please take a photo to submit.", variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setVerificationProgress(0);
    setVerificationStatus('Initializing verification...');
    
    try {
      // Progress animation sequence (same as real flow)
      setVerificationProgress(15);
      setVerificationStatus('Sending image to AI...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setVerificationProgress(35);
      setVerificationStatus('Analyzing image authenticity...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setVerificationProgress(60);
      setVerificationStatus('Checking station signs...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationProgress(85);
      setVerificationStatus('Verifying username...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVerificationProgress(100);
      
      // Always succeed in dev mode
      setVerificationStatus('✅ Station verified successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show success state
      
      // Save verification photo to localStorage
      if (photoDataUri) {
        saveStationPhoto(data.stationName, photoDataUri, 'verification');
      }
      
      toast({ 
        title: `🎉 Verified! (DEV MODE)`, 
        description: `${data.stationName} station confirmed!`, 
        className: 'bg-green-500 text-white' 
      });
      onStationVerified(data.stationName);
      form.reset();
      setPhotoDataUri(null);
    } catch (error) {
      setVerificationProgress(0);
      setVerificationStatus('💥 Verification error occurred');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred during verification.", 
        variant: 'destructive' 
      });
    } finally {
      // Reset after a delay
      setTimeout(() => {
        setIsLoading(false);
        setVerificationProgress(0);
        setVerificationStatus('');
      }, 1500);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);
  
  if (!connected) {
      return (
          <Card className="border-none shadow-none mt-4">
              <CardHeader className="p-0">
                  <CardTitle className="text-md">Verify Station Visit</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                  <p className="text-sm text-muted-foreground">Please connect your wallet to verify station visits and collect badges.</p>
              </CardContent>
          </Card>
      );
  }

  const organizedStations = getOrganizedStations();

  return (
    <Card className="border-none shadow-none mt-4">
      <CardHeader className="p-0">
        <CardTitle className="text-md">Verify Station Visit</CardTitle>
        <CardDescription className="text-sm">
          Take a selfie at a station to verify your visit
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {userLocation ? (
                    <span className="text-green-600">Location found</span>
                  ) : (
                    "Show nearby stations"
                  )}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getUserLocation}
                disabled={locationLoading}
                className="text-xs"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-1 h-3 w-3" />
                    Use Location
                  </>
                )}
              </Button>
            </div>

            {locationError && (
              <p className="text-xs text-red-600">{locationError}</p>
            )}

            <FormField
              control={form.control}
              name="stationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Station</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a station" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nearbyStations.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                            Nearby Stations
                          </div>
                          {nearbyStations.map((station) => (
                            <SelectItem key={station.name} value={station.name}>
                              <div className="flex items-center justify-between w-full">
                                <span>{station.name}</span>
                                <span className="text-xs text-green-600 ml-2">
                                  {formatDistance(station.distance)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                            All Stations
                          </div>
                        </>
                      )}
                      {organizedStations.slice(nearbyStations.length).map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="@yourname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {photoDataUri ? (
              <div className="relative group">
                <img src={photoDataUri} alt="Your selfie" className="rounded-md w-full" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPhotoDataUri(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            <Button type="button" variant="outline" onClick={startCamera} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> {photoDataUri ? 'Retake Photo' : 'Open Camera'}
            </Button>

            {/* Replace the progress bar section with this animated circle */}
            {isLoading && (
              <VerificationCircle 
                progress={verificationProgress}
                status={verificationStatus}
                isSuccess={verificationProgress === 100 && verificationStatus.includes('✅')}
                isFailed={verificationStatus.includes('❌') || verificationStatus.includes('💥')}
              />
            )}

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!photoDataUri || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify My Visit
                </>
              )}
            </Button>

            {/* Dev-only button for testing */}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-50" 
                disabled={!photoDataUri || isLoading}
                onClick={() => {
                  const formData = form.getValues();
                  if (formData.stationName && formData.username) {
                    onDevSubmit(formData);
                  } else {
                    toast({ title: "Missing Info", description: "Please select a station and enter username.", variant: 'destructive' });
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    DEV: Always Succeed
                  </>
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Selfie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
                style={{ 
                  opacity: isCameraReady ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              
              {/* Camera viewfinder overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
              </div>
              
              {/* Loading indicator */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Make sure you're clearly visible with station signs in the background
              </p>
              <p className="text-xs text-muted-foreground">
                Hold your handwritten @username clearly visible
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCameraOpen(false)}>Cancel</Button>
            <Button onClick={takePhoto} disabled={!isCameraReady}>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
