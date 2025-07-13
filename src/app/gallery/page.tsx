'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import UserProfile from '@/components/sidebar/user-profile';
import StationVerification from '@/components/sidebar/station-verification';
import Gallery from '@/components/gallery/gallery';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const ALL_STATIONS = ["Acton Town", "Aldgate", "Aldgate East", "Alperton", "Amersham", "Angel", "Archway", "Arnos Grove", "Arsenal", "Baker Street", "Balham", "Bank", "Barbican", "Barking", "Barkingside", "Barons Court", "Bayswater", "Becontree", "Belsize Park", "Bermondsey", "Bethnal Green", "Blackfriars", "Blackhorse Road", "Bond Street", "Borough", "Boston Manor", "Bounds Green", "Bow Road", "Brent Cross", "Brixton", "Bromley-by-Bow", "Buckhurst Hill", "Burnt Oak", "Caledonian Road", "Camden Town", "Canada Water", "Canary Wharf", "Canning Town", "Cannon Street", "Canons Park", "Chalfont & Latimer", "Chalk Farm", "Chancery Lane", "Charing Cross", "Chesham", "Chigwell", "Chiswick Park", "Chorleywood", "Clapham Common", "Clapham North", "Clapham South", "Cockfosters", "Colindale", "Colliers Wood", "Covent Garden", "Croxley", "Dagenham East", "Dagenham Heathway", "Debden", "Dollis Hill", "Ealing Broadway", "Ealing Common", "Earl's Court", "East Acton", "East Finchley", "East Ham", "East Putney", "Eastcote", "Edgware", "Edgware Road (Bakerloo)", "Edgware Road (Circle)", "Elephant & Castle", "Elm Park", "Embankment", "Epping", "Euston", "Euston Square", "Fairlop", "Farringdon", "Finchley Central", "Finchley Road", "Finsbury Park", "Fulham Broadway", "Gants Hill", "Gloucester Road", "Golders Green", "Goldhawk Road", "Goodge Street", "Grange Hill", "Great Portland Street", "Greenford", "Green Park", "Gunnersbury", "Hainault", "Hammersmith (District & Picc)", "Hammersmith (H&C & Circle)", "Hampstead", "Hanger Lane", "Harlesden", "Harrow & Wealdstone", "Harrow-on-the-Hill", "Hatton Cross", "Heathrow Terminal 4", "Heathrow Terminals 1, 2, 3", "Heathrow Terminal 5", "Hendon Central", "High Barnet", "Highbury & Islington", "Highgate", "High Street Kensington", "Hillingdon", "Holborn", "Holland Park", "Holloway Road", "Hornchurch", "Hounslow Central", "Hounslow East", "Hounslow West", "Hyde Park Corner", "Ickenham", "Kennington", "Kensal Green", "Kensington (Olympia)", "Kentish Town", "Kenton", "Kew Gardens", "Kilburn", "Kilburn Park", "Kingsbury", "King's Cross St. Pancras", "Knightsbridge", "Ladbroke Grove", "Lambeth North", "Lancaster Gate", "Latimer Road", "Leicester Square", "Leyton", "Leytonstone", "Liverpool Street", "London Bridge", "Loughton", "Maida Vale", "Manor House", "Mansion House", "Marble Arch", "Marylebone", "Mile End", "Mill Hill East", "Monument", "Moor Park", "Moorgate", "Morden", "Mornington Crescent", "Neasden", "Newbury Park", "North Acton", "North Ealing", "North Greenwich", "North Harrow", "North Wembley", "Northfields", "Northolt", "Northwick Park", "Northwood", "Northwood Hills", "Notting Hill Gate", "Oakwood", "Old Street", "Osterley", "Oval", "Oxford Circus", "Paddington", "Park Royal", "Parsons Green", "Perivale", "Piccadilly Circus", "Pimlico", "Pinner", "Plaistow", "Preston Road", "Putney Bridge", "Queen's Park", "Queensbury", "Queensway", "Ravenscourt Park", "Rayners Lane", "Redbridge", "Regent's Park", "Richmond", "Rickmansworth", "Roding Valley", "Royal Oak", "Ruislip", "Ruislip Gardens", "Ruislip Manor", "Russell Square", "Seven Sisters", "Shepherd's Bush (Central)", "Shepherd's Bush (H&C)", "Sloane Square", "Snaresbrook", "South Ealing", "South Harrow", "South Kensington", "South Ruislip", "South Wimbledon", "South Woodford", "Southfields", "Southgate", "Southwark", "St. James's Park", "St. John's Wood", "St. Paul's", "Stamford Brook", "Stanmore", "Stepney Green", "Stockwell", "Stonebridge Park", "Stratford", "Sudbury Hill", "Sudbury Town", "Swiss Cottage", "Temple", "Theydon Bois", "Tooting Bec", "Tooting Broadway", "Tottenham Court Road", "Tottenham Hale", "Totteridge & Whetstone", "Tower Hill", "Tufnell Park", "Turnham Green", "Turnpike Lane", "Upminster", "Upminster Bridge", "Upney", "Upton Park", "Uxbridge", "Vauxhall", "Victoria", "Walthamstow Central", "Wanstead", "Warren Street", "Warwick Avenue", "Waterloo", "Watford", "Wembley Central", "Wembley Park", "West Acton", "West Brompton", "West Ealing", "West Finchley", "West Ham", "West Hampstead", "West Harrow", "West Kensington", "West Ruislip", "Westbourne Park", "Westminster", "White City", "Whitechapel", "Willesden Green", "Willesden Junction", "Wimbledon", "Wimbledon Park", "Wood Green", "Woodford", "Woodside Park"];

export default function GalleryPage() {
  const [visitedStations, setVisitedStations] = useState<string[]>(['victoria', 'pimlico']);

  const handleStationVerified = (stationName: string) => {
    const stationId = stationName.toLowerCase().replace(/ /g, '').replace(/&/g, 'and').replace(/\(.*\)/, '').replace(/'/g, '');
    if (!visitedStations.includes(stationId)) {
      setVisitedStations((prev) => [...prev, stationId]);
    }
  };

  const sidebarContent = (
    <>
      <UserProfile collectedBadges={visitedStations} />
      <StationVerification onStationVerified={handleStationVerified} allStations={ALL_STATIONS} />
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <main className="grid flex-1 grid-cols-1 md:grid-cols-[24rem_1fr] overflow-hidden">
        <aside className="hidden md:flex h-full flex-col gap-8 overflow-y-auto border-r bg-card p-6">
          {sidebarContent}
        </aside>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-4 border-b p-4">
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
            <h1 className="text-xl font-semibold font-headline text-foreground">Station Gallery</h1>
          </div>
          <div className="relative flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            <Gallery visitedStations={visitedStations} />
          </div>
        </div>
      </main>
    </div>
  );
} 