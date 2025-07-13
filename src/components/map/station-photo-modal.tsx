'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Clock, 
  X,
  ImageIcon,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { getPhotosForStation, type StationPhoto } from '@/lib/utils';

interface StationPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
}

export default function StationPhotoModal({ isOpen, onClose, stationName }: StationPhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<StationPhoto | null>(null);
  const photos = getPhotosForStation(stationName);

  const handlePhotoClick = (photo: StationPhoto) => {
    setSelectedPhoto(photo);
  };

  const closePhotoView = () => {
    setSelectedPhoto(null); // Changed from setSelectedPhoto(photo) to setSelectedPhoto(null)
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {stationName} Station
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 pr-4">
              {/* Station info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline">
                    ✓ Verified
                  </Badge>
                </div>
              </div>

              {/* Photos grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                  <div 
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={photo.photo}
                        alt={`${stationName} - Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Photo overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                    
                    {/* Photo type badge */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant={photo.type === 'verification' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {photo.type === 'verification' ? 'Verification' : 'Additional'}
                      </Badge>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(photo.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>
                ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No photos yet</h3>
                  <p className="text-muted-foreground mb-2">
                    You haven't taken any photos at this station yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visit this station and take verification photos to see them here!
                  </p>
                </div>
              )}

              {/* Empty state for additional photos - only show if we have verification photos */}
              {photos.length > 0 && photos.filter(p => p.type === 'additional').length === 0 && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">No additional photos yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add more photos of your experiences at this station
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Full-size photo viewer */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={closePhotoView}>
          <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {stationName} Station
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={closePhotoView}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Photo info */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant={selectedPhoto.type === 'verification' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  {selectedPhoto.type === 'verification' ? 'Verification Photo' : 'Additional Photo'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(selectedPhoto.timestamp), 'MMM d, yyyy h:mm a')}
                </Badge>
              </div>

              {/* Full-size photo */}
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.photo}
                  alt={`${stationName} - Full size`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 