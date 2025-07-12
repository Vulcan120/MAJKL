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

export default function StationVerification({ onStationVerified, allStations }: StationVerificationProps) {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ title: "Camera Error", description: "Could not access your camera. Please check permissions.", variant: 'destructive' });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setPhotoDataUri(canvas.toDataURL('image/jpeg'));
      setIsCameraOpen(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof VerificationSchema>) => {
    if (!photoDataUri) {
      toast({ title: "No Photo", description: "Please take a photo to submit.", variant: 'destructive' });
      return;
    }
    if (!connected) {
        toast({ title: "Wallet Not Connected", description: "Please connect your wallet to verify.", variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
      const result = await verifyStationImageAction({
        photoDataUri,
        stationName: data.stationName,
        username: data.username,
      });

      if (result.isAuthentic) {
        toast({ title: `Success!`, description: `${data.stationName} badge earned!`, className: 'bg-green-500 text-white' });
        onStationVerified(data.stationName);
        form.reset();
        setPhotoDataUri(null);
      } else {
        toast({ title: "Verification Failed", description: result.verificationResult.slice(0, 100), variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during verification.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
                <img src={photoDataUri} alt="Your selfie" className="rounded-md" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPhotoDataUri(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ): null}

            <Button type="button" variant="outline" onClick={startCamera} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> {photoDataUri ? 'Retake Photo' : 'Open Camera'}
            </Button>

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!photoDataUri || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Verify My Visit
            </Button>
          </form>
        </Form>
      </CardContent>
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="p-0 max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="p-4 border-b">
                <DialogTitle>Take Selfie</DialogTitle>
            </DialogHeader>
            <div className="p-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md aspect-video object-cover" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <DialogFooter className="p-4 border-t">
                <Button onClick={() => setIsCameraOpen(false)} variant="outline">Cancel</Button>
                <Button onClick={takePhoto}>Take Photo</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
