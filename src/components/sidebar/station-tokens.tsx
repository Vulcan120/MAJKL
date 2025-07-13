'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Coins, 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { getAllUserTokens, type StationToken } from '@/lib/token-system';
import { useToast } from '@/hooks/use-toast';

export default function StationTokens() {
  const [selectedToken, setSelectedToken] = useState<StationToken | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tokens, setTokens] = useState<StationToken[]>([]);
  const { toast } = useToast();
  
  // Refresh tokens from localStorage
  const refreshTokens = () => {
    setTokens(getAllUserTokens());
  };
  
  // Load tokens on mount and set up interval to check for updates
  useEffect(() => {
    refreshTokens();
    
    // Set up interval to check for new tokens (in case they're added from other components)
    const interval = setInterval(refreshTokens, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleTokenClick = (token: StationToken) => {
    setSelectedToken(token);
    setIsDetailModalOpen(true);
  };
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
      className: "bg-green-500 text-white"
    });
  };
  
  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Station Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Coins className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tokens yet</h3>
            <p className="text-muted-foreground">
              Verify station visits to mint unique tokens!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Station Tokens ({tokens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tokens.map((token) => (
              <div
                key={token.tokenMint}
                className="relative group cursor-pointer"
                onClick={() => handleTokenClick(token)}
              >
                <div className="aspect-square bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors">
                  <img
                    src={token.metadata.image}
                    alt={token.metadata.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                {/* Token overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                
                {/* Verification badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="text-xs">
                    ✓ Verified
                  </Badge>
                </div>
                
                {/* Station name */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs truncate">
                    {token.stationName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token Detail Modal */}
      {selectedToken && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Coins className="w-6 h-6 text-yellow-500" />
                {selectedToken.metadata.name}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[80vh] overflow-y-auto">
              <div className="space-y-6 pr-4">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Token Image */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 mx-auto md:mx-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-xl">
                      <img
                        src={selectedToken.metadata.image}
                        alt={selectedToken.metadata.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 space-y-4">
                    {/* Station Header */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">{selectedToken.stationName}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(selectedToken.mintedAt), 'MMM d, yyyy')}
                        </Badge>
                        <Badge 
                          variant="default" 
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Verified & Minted
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Collection</div>
                        <div className="font-semibold">{selectedToken.metadata.properties.collection.name}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Symbol</div>
                        <div className="font-mono font-semibold">{selectedToken.metadata.symbol}</div>
                      </Card>
                    </div>

                    {/* Description */}
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground mb-2">Description</div>
                      <p className="text-sm leading-relaxed">
                        {selectedToken.metadata.description}
                      </p>
                    </Card>
                  </div>
                </div>

                {/* Station Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedToken.metadata.attributes.map((attr, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {attr.trait_type}
                      </div>
                      <div className="font-semibold text-sm">
                        {attr.value}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Blockchain Information */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Blockchain Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Token Mint Address</div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-xs font-mono truncate">
                          {selectedToken.tokenMint}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedToken.tokenMint, 'Token mint address')}
                          className="flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Transaction Signature</div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-xs font-mono truncate">
                          {selectedToken.transactionSignature}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedToken.transactionSignature, 'Transaction signature')}
                          className="flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 