"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, Clock, X, ImageIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import {
  getPhotosForStation,
  getPhotoDataUrl,
  type StationPhoto,
} from "@/lib/utils";
import { stationIdToName } from "@/lib/station-utils";

interface StationPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string; // This could be either ID or display name
}

// Extended photo interface with the actual photo data
interface PhotoWithData extends StationPhoto {
  photoData: string | null;
}

export default function StationPhotoModal({
  isOpen,
  onClose,
  stationName,
}: StationPhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithData | null>(
    null
  );
  const [photosWithData, setPhotosWithData] = useState<PhotoWithData[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert station ID to display name if needed
  const displayName = stationName.includes("-")
    ? stationIdToName(stationName)
    : stationName;

  // Load photos with their data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const photos = getPhotosForStation(stationName);

    // Load the actual photo data for each photo
    const photosWithDataPromises = photos.map(
      async (photo): Promise<PhotoWithData> => {
        const photoData = getPhotoDataUrl(photo.photoId);
        return {
          ...photo,
          photoData,
        };
      }
    );

    Promise.all(photosWithDataPromises).then((loadedPhotos) => {
      setPhotosWithData(loadedPhotos);
      setLoading(false);
    });
  }, [isOpen, stationName]);

  const handlePhotoClick = (photo: PhotoWithData) => {
    setSelectedPhoto(photo);
  };

  const closePhotoView = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {displayName} Station
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 pr-4">
              {/* Station info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {photosWithData.length} photo
                    {photosWithData.length !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="outline">✓ Verified</Badge>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-pulse">Loading photos...</div>
                </div>
              )}

              {/* Photos grid */}
              {!loading && photosWithData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photosWithData.map((photo, index) => (
                    <div
                      key={photo.photoId}
                      className="relative group cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {photo.photoData ? (
                          <img
                            src={photo.photoData}
                            alt={`${displayName} - Photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Photo overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />

                      {/* Photo type badge */}
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={
                            photo.type === "verification"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {photo.type === "verification"
                            ? "Verification"
                            : "Additional"}
                        </Badge>
                      </div>

                      {/* Timestamp */}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(photo.timestamp), "MMM d, h:mm a")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loading ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No photos yet</h3>
                  <p className="text-muted-foreground mb-2">
                    You haven't taken any photos at this station yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visit this station and take verification photos to see them
                    here!
                  </p>
                </div>
              ) : null}

              {/* Empty state for additional photos - only show if we have verification photos */}
              {!loading &&
                photosWithData.length > 0 &&
                photosWithData.filter((p) => p.type === "additional").length ===
                  0 && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">
                      No additional photos yet
                    </p>
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
                  {displayName} Station
                </DialogTitle>
                <Button variant="ghost" size="icon" onClick={closePhotoView}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Photo info */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedPhoto.type === "verification"
                      ? "default"
                      : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  {selectedPhoto.type === "verification"
                    ? "Verification Photo"
                    : "Additional Photo"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(
                    new Date(selectedPhoto.timestamp),
                    "MMM d, yyyy h:mm a"
                  )}
                </Badge>
              </div>

              {/* Full-size photo */}
              <div className="flex justify-center">
                {selectedPhoto.photoData ? (
                  <img
                    src={selectedPhoto.photoData}
                    alt={`${displayName} - Full size`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
