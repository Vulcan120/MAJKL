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
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyStationImageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const VerificationSchema = z.object({
  stationName: z.string().min(1, 'Please select a station'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(15, 'Username cannot exceed 15 characters').startsWith('@', 'Username must start with @'),
});

interface StationVerificationProps {
  onStationVerified: (stationName: string) => void;
  allStations: string[];
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
          
          {/* Success checkmark */}
          {isSuccess && (
            <g className="animate-in fade-in duration-300">
              <CheckCircle 
                size={24} 
                className="text-green-500" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </g>
          )}
          
          {/* Failure X */}
          {isFailed && (
            <g className="animate-in fade-in duration-300">
              <XCircle 
                size={24} 
                className="text-red-500" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </g>
          )}
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

  const form = useForm<z.infer<typeof VerificationSchema>>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: { stationName: '', username: '' },
  });
  
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
      });
      
      setVerificationProgress(85);
      setVerificationStatus('Verifying username...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVerificationProgress(100);
      
      if (result.isAuthentic) {
        setVerificationStatus('✅ Station verified successfully!');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Show success state
        
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

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0">
        <CardTitle className="text-md">Verify Station Visit</CardTitle>
        <CardDescription>Take a selfie at a station to get your badge.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control} name="stationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a station" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allStations.sort().map(station => (
                        <SelectItem key={station} value={station}>{station}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>@Username (must be in photo)</FormLabel>
                  <FormControl>
                    <Input placeholder="@your_handle" {...field} />
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
          </form>
        </Form>
      </CardContent>
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        if (!open) {
          stopCamera();
        }
        setIsCameraOpen(open);
      }}>
        <DialogContent className="p-0 w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] mx-auto">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Take Your Selfie</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Hold your @username sign clearly and make sure the station is visible
            </p>
          </DialogHeader>
          
          <div className="relative p-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[4/3]">
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
              
              {/* Overlay guide - only show when camera is ready */}
              {isCameraReady && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                  <div className="absolute top-4 left-4 right-4 text-white text-xs bg-black/70 rounded p-2">
                    📄 Hold your @username sign clearly<br/>
                    🚇 Make sure station signs are visible<br/>
                    😊 Keep your face in frame
                  </div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <DialogFooter className="p-4 border-t gap-2">
            <Button 
              onClick={() => {
                setIsCameraOpen(false);
                stopCamera();
              }} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={takePhoto} 
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!isCameraReady}
            >
              📸 Take Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
