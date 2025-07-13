import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import londonData from "@/lib/london.json";

// Station token metadata structure
export interface StationTokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // Base64 data URL of the token image
  attributes: {
    trait_type: string;
    value: string;
  }[];
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
    collection: {
      name: string;
      family: string;
    };
  };
}

// Token data structure for storage
export interface StationToken {
  stationName: string;
  tokenMint: string; // Solana mint address
  metadata: StationTokenMetadata;
  mintedAt: string; // ISO timestamp
  transactionSignature: string;
  verified: boolean;
}

// Get the tube lines for a station
function getStationLines(
  stationName: string
): { color: string; name: string }[] {
  const lines: { color: string; name: string }[] = [];

  Object.entries(londonData).forEach(([key, lineData]) => {
    if (
      typeof lineData === "object" &&
      lineData !== null &&
      "nodes" in lineData
    ) {
      const line = lineData as any;
      if (line.nodes?.some((node: any) => node.name === stationName)) {
        lines.push({
          color: line.color,
          name: line.name || key,
        });
      }
    }
  });

  return lines;
}

// Generate station-specific token metadata
export function generateStationTokenMetadata(
  stationName: string
): StationTokenMetadata {
  const lines = getStationLines(stationName);
  const primaryLine = lines[0] || { color: "#000000", name: "Unknown" };

  // Generate a consistent but unique token image based on station
  const tokenImage = generateTokenImage(stationName, primaryLine.color, lines);

  return {
    name: `${stationName} Station Token`,
    symbol: "TUBE",
    description: `Proof of visit to ${stationName} station on the London Underground. This NFT represents your authentic presence at this location, verified through AI and blockchain technology.`,
    image: tokenImage,
    attributes: [
      {
        trait_type: "Station Name",
        value: stationName,
      },
      {
        trait_type: "Primary Line",
        value: primaryLine.name,
      },
      {
        trait_type: "Line Color",
        value: primaryLine.color,
      },
      {
        trait_type: "Total Lines",
        value: lines.length.toString(),
      },
      {
        trait_type: "Network",
        value: "London Underground",
      },
      {
        trait_type: "Verification Method",
        value: "AI + Blockchain",
      },
    ],
    properties: {
      files: [
        {
          uri: tokenImage,
          type: "image/svg+xml",
        },
      ],
      category: "image",
      collection: {
        name: "Tubler Station Tokens",
        family: "Tubler",
      },
    },
  };
}

// Generate a consistent SVG token image
function generateTokenImage(
  stationName: string,
  primaryColor: string,
  lines: { color: string; name: string }[]
): string {
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;

  // Create SVG with London Underground roundel style
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />
      
      <!-- Outer ring (London Underground style) -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${primaryColor}" stroke-width="8" filter="url(#glow)" />
      
      <!-- Station name bar (London Underground style) -->
      <rect x="${centerX - 120}" y="${
    centerY - 15
  }" width="240" height="30" fill="${primaryColor}" rx="15" />
      
      <!-- Station name text -->
      <text x="${centerX}" y="${
    centerY + 5
  }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ${stationName}
      </text>
      
      <!-- Line indicators -->
      ${lines
        .map(
          (line, index) => `
        <circle cx="${centerX - 60 + index * 30}" cy="${
            centerY + 40
          }" r="8" fill="${line.color}" stroke="white" stroke-width="2" />
      `
        )
        .join("")}
      
      <!-- Tubler branding -->
      <text x="${centerX}" y="${
    centerY - 60
  }" text-anchor="middle" fill="${primaryColor}" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        Tubler
      </text>
      
      <!-- Verification badge -->
      <circle cx="${centerX + 80}" cy="${centerY - 80}" r="15" fill="#10b981" />
      <text x="${centerX + 80}" y="${
    centerY - 75
  }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ✓
      </text>
    </svg>
  `;

  // Use encodeURIComponent instead of btoa to handle special characters
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Storage utilities for tokens
export function saveStationToken(
  stationName: string,
  token: StationToken
): void {
  try {
    const existingTokens = getStationTokens();
    existingTokens[stationName] = token;
    localStorage.setItem("stationTokens", JSON.stringify(existingTokens));
  } catch (error) {
    console.error("Error saving station token:", error);
  }
}

export function getStationTokens(): { [stationName: string]: StationToken } {
  try {
    const data = localStorage.getItem("stationTokens");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting station tokens:", error);
    return {};
  }
}

export function getTokenForStation(stationName: string): StationToken | null {
  const tokens = getStationTokens();
  return tokens[stationName] || null;
}

export function getAllUserTokens(): StationToken[] {
  const tokens = getStationTokens();
  return Object.values(tokens);
}

// Mock minting function for demo (replace with actual Solana minting)
export async function mintStationToken(
  stationName: string
): Promise<StationToken> {
  const metadata = generateStationTokenMetadata(stationName);

  // For demo purposes, simulate minting
  const mockMint = `${stationName
    .toLowerCase()
    .replace(/\s+/g, "")}_${Date.now()}`;
  const mockSignature = `mock_tx_${Date.now()}`;

  const token: StationToken = {
    stationName,
    tokenMint: mockMint,
    metadata,
    mintedAt: new Date().toISOString(),
    transactionSignature: mockSignature,
    verified: true,
  };

  // Save to localStorage
  saveStationToken(stationName, token);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return token;
}

// Real Solana minting function (to be implemented)
export async function mintStationTokenOnSolana(
  stationName: string,
  wallet: any,
  connection: Connection
): Promise<StationToken> {
  // TODO: Implement actual Solana NFT minting
  // This would involve:
  // 1. Creating a new mint account
  // 2. Creating metadata account
  // 3. Minting the token to user's wallet
  // 4. Storing metadata on-chain or IPFS

  throw new Error(
    "Solana minting not yet implemented - using mock minting for demo"
  );
}

export function hasStationToken(stationName: string): boolean {
  const token = getTokenForStation(stationName);
  return token !== null && token.verified;
}
