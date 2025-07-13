"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export function ICPIndicator() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Simulate checking ICP connection
    const checkConnection = async () => {
      try {
        // This would be a real check to your ICP canisters
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="secondary" className="animate-pulse">
          Checking ICP...
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            ICP Connected
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            ICP Disconnected
          </Badge>
        )}
        
        <a
          href="http://127.0.0.1:8000/?canisterId=uzt4z-lp777-77774-qaabq-cai&id=uxrrr-q7777-77774-qaaaq-cai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Canister UI
        </a>
      </div>
    </div>
  );
} 