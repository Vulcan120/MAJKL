'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Ticket } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserProfileProps {
  collectedBadges: string[];
}

export default function UserProfile({ collectedBadges }: UserProfileProps) {
  const { publicKey, connected } = useWallet();

  const formattedBadges = collectedBadges.map(stationId => 
    stationId
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('and', ' & ')
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0">
        <div className="flex items-center gap-4">
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
  );
}
