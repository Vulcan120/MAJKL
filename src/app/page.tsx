'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Keep Button import
import Header from '@/components/layout/header';
import londonData from '@/lib/london.json';
import TubeMap from '@/components/map/tube-map';
import UserProfile from '@/components/sidebar/user-profile';
import StationVerification from '@/components/sidebar/station-verification';
import TubeLineKey, { LineData } from '@/components/sidebar/tube-line-key';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Rocket, LocateIcon } from 'lucide-react';

const ALL_STATIONS = ["Acton Town", "Aldgate", "Aldgate East", "Alperton", "Amersham", "Angel", "Archway", "Arnos Grove", "Arsenal", "Baker Street", "Balham", "Bank", "Barbican", "Barking", "Barkingside", "Barons Court", "Bayswater", "Becontree", "Belsize Park", "Bermondsey", "Bethnal Green", "Blackfriars", "Blackhorse Road", "Bond Street", "Borough", "Boston Manor", "Bounds Green", "Bow Road", "Brent Cross", "Brixton", "Bromley-by-Bow", "Buckhurst Hill", "Burnt Oak", "Caledonian Road", "Camden Town", "Canada Water", "Canary Wharf", "Canning Town", "Cannon Street", "Canons Park", "Chalfont & Latimer", "Chalk Farm", "Chancery Lane", "Charing Cross", "Chesham", "Chigwell", "Chiswick Park", "Chorleywood", "Clapham Common", "Clapham North", "Clapham South", "Cockfosters", "Colindale", "Colliers Wood", "Covent Garden", "Croxley", "Dagenham East", "Dagenham Heathway", "Debden", "Dollis Hill", "Ealing Broadway", "Ealing Common", "Earl's Court", "East Acton", "East Finchley", "East Ham", "East Putney", "Eastcote", "Edgware", "Edgware Road (Bakerloo)", "Edgware Road (Circle)", "Elephant & Castle", "Elm Park", "Embankment", "Epping", "Euston", "Euston Square", "Fairlop", "Farringdon", "Finchley Central", "Finchley Road", "Finsbury Park", "Fulham Broadway", "Gants Hill", "Gloucester Road", "Golders Green", "Goldhawk Road", "Goodge Street", "Grange Hill", "Great Portland Street", "Greenford", "Green Park", "Gunnersbury", "Hainault", "Hammersmith (District & Picc)", "Hammersmith (H&C & Circle)", "Hampstead", "Hanger Lane", "Harlesden", "Harrow & Wealdstone", "Harrow-on-the-Hill", "Hatton Cross", "Heathrow Terminal 4", "Heathrow Terminals 1, 2, 3", "Heathrow Terminal 5", "Hendon Central", "High Barnet", "Highbury & Islington", "Highgate", "High Street Kensington", "Hillingdon", "Holborn", "Holland Park", "Holloway Road", "Hornchurch", "Hounslow Central", "Hounslow East", "Hounslow West", "Hyde Park Corner", "Ickenham", "Kennington", "Kensal Green", "Kensington (Olympia)", "Kentish Town", "Kenton", "Kew Gardens", "Kilburn", "Kilburn Park", "Kingsbury", "King's Cross St. Pancras", "Knightsbridge", "Ladbroke Grove", "Lambeth North", "Lancaster Gate", "Latimer Road", "Leicester Square", "Leyton", "Leytonstone", "Liverpool Street", "London Bridge", "Loughton", "Maida Vale", "Manor House", "Mansion House", "Marble Arch", "Marylebone", "Mile End", "Mill Hill East", "Monument", "Moor Park", "Moorgate", "Morden", "Mornington Crescent", "Neasden", "Newbury Park", "North Acton", "North Ealing", "North Greenwich", "North Harrow", "North Wembley", "Northfields", "Northolt", "Northwick Park", "Northwood", "Northwood Hills", "Notting Hill Gate", "Oakwood", "Old Street", "Osterley", "Oval", "Oxford Circus", "Paddington", "Park Royal", "Parsons Green", "Perivale", "Piccadilly Circus", "Pimlico", "Pinner", "Plaistow", "Preston Road", "Putney Bridge", "Queen's Park", "Queensbury", "Queensway", "Ravenscourt Park", "Rayners Lane", "Redbridge", "Regent's Park", "Richmond", "Rickmansworth", "Roding Valley", "Royal Oak", "Ruislip", "Ruislip Gardens", "Ruislip Manor", "Russell Square", "Seven Sisters", "Shepherd's Bush (Central)", "Shepherd's Bush (H&C)", "Sloane Square", "Snaresbrook", "South Ealing", "South Harrow", "South Kensington", "South Ruislip", "South Wimbledon", "South Woodford", "Southfields", "Southgate", "Southwark", "St. James's Park", "St. John's Wood", "St. Paul's", "Stamford Brook", "Stanmore", "Stepney Green", "Stockwell", "Stonebridge Park", "Stratford", "Sudbury Hill", "Sudbury Town", "Swiss Cottage", "Temple", "Theydon Bois", "Tooting Bec", "Tooting Broadway", "Tottenham Court Road", "Tottenham Hale", "Totteridge & Whetstone", "Tower Hill", "Tufnell Park", "Turnham Green", "Turnpike Lane", "Upminster", "Upminster Bridge", "Upney", "Upton Park", "Uxbridge", "Vauxhall", "Victoria", "Walthamstow Central", "Wanstead", "Warren Street", "Warwick Avenue", "Waterloo", "Watford", "Wembley Central", "Wembley Park", "West Acton", "West Brompton", "West Ealing", "West Finchley", "West Ham", "West Hampstead", "West Harrow", "West Kensington", "West Ruislip", "Westbourne Park", "Westminster", "White City", "Whitechapel", "Willesden Green", "Willesden Junction", "Wimbledon", "Wimbledon Park", "Wood Green", "Woodford", "Woodside Park"];

export default function Home() {
  const [visitedStations, setVisitedStations] = useState<string[]>(['victoria', 'pimlico']);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const handleStationVerified = (stationName: string) => {
    const stationId = stationName.toLowerCase().replace(/ /g, '').replace(/&/g, 'and').replace(/\(.*\)/, '').replace(/'/g, '');
    if (!visitedStations.includes(stationId)) {
      setVisitedStations((prev) => [...prev, stationId]);
    }
  };

  const lineStationCounts: LineData[] = useMemo(() => {
    return londonData.lines.map((line: any) => ({
      // Format the line name: replace hyphens with spaces and capitalize each word
      formattedName: line.name
        .replace(/-/g, ' ')
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      name: line.name, // Include the original name property
      color: line.color,
      count: line.nodes.length,
    }));
  }, [londonData.lines]);

  // Effect to get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setGeolocationError(null); // Clear any previous errors
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGeolocationError('Geolocation permission denied. Please enable location access.');
              break;
            case error.POSITION_UNAVAILABLE:
              setGeolocationError('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              setGeolocationError('The request to get user location timed out.');
              break;
          }
        }
      );
    } else {
      setGeolocationError('Geolocation is not supported by your browser.');
    }
  }, []); // Empty dependency array means this effect runs once on mount

  const sidebarContent = (
    <>
      <UserProfile collectedBadges={visitedStations} />
 <StationVerification onStationVerified={handleStationVerified} allStations={ALL_STATIONS} />
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="grid flex-1 grid-cols-1 md:grid-cols-[24rem_1fr_16rem] overflow-hidden">
        <aside className="hidden md:flex h-full flex-col gap-8 overflow-y-auto border-r bg-card p-6">
          {sidebarContent}
        </aside>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-4 border-b p-4 md:pr-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[24rem] p-6 pt-10 overflow-y-auto">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold font-headline text-foreground">London Underground Map</h1>
          </div>
          <div className="relative flex-1 bg-gray-100 dark:bg-gray-900">
            <TubeMap visitedStations={visitedStations} userLocation={userLocation} />
            {geolocationError && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-20">
                <p className="text-sm">{geolocationError}</p>
              </div>
            )}
            {/* Button to recenter map on user location - implement recentering logic in TubeMap */}
            {userLocation && !geolocationError && (
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 left-4 z-20 rounded-full shadow-lg"
                onClick={() => {
                  // TODO: Add logic here to recenter the map on userLocation
                  console.log('Recenter map on user location:', userLocation);
                }}
              >
                <LocateIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right-hand sidebar for line key on larger screens */}
        <aside className="hidden md:flex h-full flex-col gap-8 overflow-y-auto border-l bg-card p-6 w-64 flex-shrink-0 md:col-start-3">
 <TubeLineKey lineData={lineStationCounts} />
        </aside>

        {/* Mobile button for line key modal */}
 <div className="md:hidden absolute bottom-4 right-4 z-20">
 <Sheet>
 <SheetTrigger asChild>
 <Button variant="outline" size="lg" className="rounded-full shadow-lg">
 <Rocket className="h-5 w-5 mr-2" />
                  Tube Lines
 </Button>
 </SheetTrigger>
 <SheetContent side="right" className="w-[24rem] p-6 pt-10 overflow-y-auto">
 <TubeLineKey lineData={lineStationCounts} />
 </SheetContent>
 </Sheet>
        </div>
      </main>
    </div>
  );
}
