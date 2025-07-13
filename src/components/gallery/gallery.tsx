'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Plus, 
  MapPin, 
  Clock, 
  Upload,
  X,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface StationVisit {
  id: string;
  stationName: string;
  verificationPhoto: string;
  timestamp: Date;
  additionalPhotos: string[];
  verified: boolean;
}

interface GalleryProps {
  visitedStations: string[];
}

// Mock data for demonstration - you'll replace this with real data
const mockStationVisits: StationVisit[] = [
  {
    id: 'victoria',
    stationName: 'Victoria',
    verificationPhoto: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&h=400&fit=crop',
    timestamp: new Date('2024-01-15T10:30:00'),
    additionalPhotos: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    ],
    verified: true
  },
  {
    id: 'pimlico',
    stationName: 'Pimlico',
    verificationPhoto: 'https://images.unsplash.com/photo-1520637736862-4d197d17c6a8?w=400&h=400&fit=crop',
    timestamp: new Date('2024-01-15T11:45:00'),
    additionalPhotos: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=400&fit=crop',
    ],
    verified: true
  }
];

export default function Gallery({ visitedStations }: GalleryProps) {
  const [selectedVisit, setSelectedVisit] = useState<StationVisit | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter visits based on visited stations
  const stationVisits = mockStationVisits.filter(visit => 
    visitedStations.includes(visit.id)
  );

  const openVisitDetail = (visit: StationVisit) => {
    setSelectedVisit(visit);
    setIsDetailModalOpen(true);
  };

  const handleAddPhoto = (visitId: string) => {
    // TODO: Implement photo upload functionality
    console.log('Add photo for visit:', visitId);
  };

  if (stationVisits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-semibold">No station visits yet</h3>
          <p className="text-muted-foreground">
            Start exploring tube stations to build your photo gallery!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Station Gallery</h2>
          <p className="text-muted-foreground">
            {stationVisits.length} station{stationVisits.length !== 1 ? 's' : ''} visited
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stationVisits.map((visit) => (
            <Card 
              key={visit.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => openVisitDetail(visit)}
            >
              <div className="relative">
                {/* Main verification photo */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  <img
                    src={visit.verificationPhoto}
                    alt={`${visit.stationName} station`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant={visit.verified ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {visit.verified ? '✓ Verified' : 'Pending'}
                  </Badge>
                </div>

                {/* Photo count indicator */}
                {visit.additionalPhotos.length > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    +{visit.additionalPhotos.length}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{visit.stationName}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(visit.timestamp, 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    London Underground
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedVisit && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedVisit.stationName} Station
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(selectedVisit.timestamp, 'MMMM d, yyyy \'at\' h:mm a')}
                  </div>
                  <Badge variant={selectedVisit.verified ? "default" : "secondary"}>
                    {selectedVisit.verified ? '✓ Verified' : 'Pending'}
                  </Badge>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-6 pr-4">
                  {/* Verification Photo Section */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Verification Photo
                    </h3>
                    <div className="relative">
                      <img
                        src={selectedVisit.verificationPhoto}
                        alt={`${selectedVisit.stationName} verification`}
                        className="w-full max-w-md rounded-lg shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Additional Photos Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Additional Photos ({selectedVisit.additionalPhotos.length})
                      </h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddPhoto(selectedVisit.id)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Photo
                      </Button>
                    </div>

                    {selectedVisit.additionalPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedVisit.additionalPhotos.map((photo, index) => (
                          <div 
                            key={index}
                            className="relative group"
                          >
                            <img
                              src={photo}
                              alt={`Additional photo ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                              <Button 
                                size="icon" 
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement photo deletion
                                  console.log('Delete photo:', index);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-2">No additional photos yet</p>
                        <p className="text-sm text-muted-foreground">
                          Add photos of your activities, food, or experiences at this station
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => handleAddPhoto(selectedVisit.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Photo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 