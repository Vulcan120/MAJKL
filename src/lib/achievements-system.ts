// Note: Solana imports are commented out until dependencies are installed
// import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
// import { useWallet } from '@solana/wallet-adapter-react';

import type { ICPAchievementData, ICPMintingRequest } from './icp-bridge';

// Achievement milestone interface
interface AchievementMilestone {
  visits: number;
  name: string;
  description: string;
}

// Achievement types and milestones
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requiredVisits: number;
  tokenMint?: string; // Solana mint address
  metadata: AchievementMetadata;
  unlockedAt?: string; // ISO timestamp
  transactionSignature?: string;
  verified: boolean;
}

export interface AchievementMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // Base64 data URL of the achievement image
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

// Achievement milestones for 270 total stations
const ACHIEVEMENT_MILESTONES: AchievementMilestone[] = [
  { visits: 1, name: "First Steps", description: "Visit your first tube station" },
  { visits: 10, name: "Getting Around", description: "Visit 10 tube stations" },
  { visits: 25, name: "Tube Explorer", description: "Visit 25 tube stations" },
  { visits: 50, name: "London Navigator", description: "Visit 50 tube stations" },
  { visits: 75, name: "Underground Veteran", description: "Visit 75 tube stations" },
  { visits: 100, name: "Metro Master", description: "Visit 100 tube stations" },
  { visits: 150, name: "Tube Network Expert", description: "Visit 150 tube stations" },
  { visits: 200, name: "London Underground Legend", description: "Visit 200 tube stations" },
  { visits: 250, name: "Almost There", description: "Visit 250 tube stations" },
  { visits: 270, name: "Tube Completionist", description: "Visit all 270 tube stations" }
];

// Generate achievement metadata
function generateAchievementMetadata(achievement: AchievementMilestone): AchievementMetadata {
  const tokenImage = generateAchievementImage(achievement.name, achievement.visits);
  
  return {
    name: `${achievement.name} Achievement`,
    symbol: 'TUBE_ACH',
    description: `${achievement.description}. This achievement token represents your dedication to exploring the London Underground network.`,
    image: tokenImage,
    attributes: [
      {
        trait_type: 'Achievement Type',
        value: 'Station Visit Milestone'
      },
      {
        trait_type: 'Required Visits',
        value: achievement.visits.toString()
      },
      {
        trait_type: 'Network',
        value: 'London Underground'
      },
      {
        trait_type: 'Verification Method',
        value: 'AI + Blockchain'
      },
      {
        trait_type: 'Rarity',
        value: getRarityLevel(achievement.visits)
      }
    ],
    properties: {
      files: [
        {
          uri: tokenImage,
          type: 'image/svg+xml'
        }
      ],
      category: 'image',
      collection: {
        name: 'TubeHacks Achievements',
        family: 'TubeHacks'
      }
    }
  };
}

// Generate achievement rarity level
function getRarityLevel(visits: number): string {
  if (visits === 1) return 'Common';
  if (visits <= 25) return 'Uncommon';
  if (visits <= 100) return 'Rare';
  if (visits <= 200) return 'Epic';
  if (visits <= 250) return 'Legendary';
  return 'Mythic'; // 270 visits
}

// Generate achievement SVG image
function generateAchievementImage(achievementName: string, requiredVisits: number): string {
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;
  
  // Color based on rarity
  const colors = {
    Common: '#6B7280',
    Uncommon: '#10B981',
    Rare: '#3B82F6',
    Epic: '#8B5CF6',
    Legendary: '#F59E0B',
    Mythic: '#EF4444'
  };
  
  const rarity = getRarityLevel(requiredVisits);
  const primaryColor = colors[rarity as keyof typeof colors] || '#6B7280';
  
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="trophyGradient">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.4" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />
      
      <!-- Outer ring -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${primaryColor}" stroke-width="8" filter="url(#glow)" />
      
      <!-- Trophy icon -->
      <g transform="translate(${centerX}, ${centerY - 20})">
        <!-- Trophy base -->
        <rect x="-25" y="20" width="50" height="8" fill="${primaryColor}" rx="4" />
        <!-- Trophy cup -->
        <path d="M -20 20 L -15 0 L -10 -10 L 10 -10 L 15 0 L 20 20 Z" fill="url(#trophyGradient)" stroke="${primaryColor}" stroke-width="2" />
        <!-- Trophy handles -->
        <path d="M -20 10 Q -25 5 -20 0" fill="none" stroke="${primaryColor}" stroke-width="3" />
        <path d="M 20 10 Q 25 5 20 0" fill="none" stroke="${primaryColor}" stroke-width="3" />
      </g>
      
      <!-- Achievement name -->
      <text x="${centerX}" y="${centerY + 60}" text-anchor="middle" fill="${primaryColor}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
        ${achievementName}
      </text>
      
      <!-- Visit count -->
      <text x="${centerX}" y="${centerY + 80}" text-anchor="middle" fill="${primaryColor}" font-family="Arial, sans-serif" font-size="12">
        ${requiredVisits} Stations
      </text>
      
      <!-- Rarity badge -->
      <rect x="${centerX - 40}" y="${centerY - 100}" width="80" height="20" fill="${primaryColor}" rx="10" />
      <text x="${centerX}" y="${centerY - 87}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">
        ${rarity}
      </text>
      
      <!-- TubeHacks branding -->
      <text x="${centerX}" y="${centerY - 120}" text-anchor="middle" fill="${primaryColor}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">
        TUBEHACKS
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Storage utilities for achievements
function saveAchievement(achievement: Achievement): void {
  try {
    const existingAchievements = getAchievements();
    existingAchievements[achievement.id] = achievement;
    localStorage.setItem('achievements', JSON.stringify(existingAchievements));
  } catch (error) {
    console.error('Error saving achievement:', error);
  }
}

function getAchievements(): { [id: string]: Achievement } {
  try {
    const data = localStorage.getItem('achievements');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting achievements:', error);
    return {};
  }
}

function getAchievementById(id: string): Achievement | null {
  const achievements = getAchievements();
  return achievements[id] || null;
}

function getAllUserAchievements(): Achievement[] {
  const achievements = getAchievements();
  return Object.values(achievements);
}

// Check if user has unlocked an achievement
function hasAchievement(requiredVisits: number): boolean {
  const achievements = getAllUserAchievements();
  return achievements.some(achievement => achievement.requiredVisits === requiredVisits && achievement.verified);
}

// Get current visit count
function getCurrentVisitCount(): number {
  // Import token system functions
  // NOTE: This must be a require for SSR compatibility
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getAllUserTokens } = require('./token-system');
  const tokens = getAllUserTokens();
  return tokens.filter((token: any) => token.verified).length;
}

// Check for new achievements and mint them
async function checkAndMintAchievements(): Promise<Achievement[]> {
  const currentVisits = getCurrentVisitCount();
  const unlockedAchievements: Achievement[] = [];
  
  for (const milestone of ACHIEVEMENT_MILESTONES) {
    if (currentVisits >= milestone.visits && !hasAchievement(milestone.visits)) {
      const achievement = await mintAchievement(milestone);
      unlockedAchievements.push(achievement);
    }
  }
  
  return unlockedAchievements;
}

// Mock minting function for demo (replace with actual Solana minting via ICP)
async function mintAchievement(milestone: AchievementMilestone): Promise<Achievement> {
  const metadata = generateAchievementMetadata(milestone);
  
  // For demo purposes, simulate minting
  const mockMint = `achievement_${milestone.visits}_${Date.now()}`;
  const mockSignature = `mock_achievement_tx_${Date.now()}`;
  
  const achievement: Achievement = {
    id: `achievement_${milestone.visits}`,
    name: milestone.name,
    description: milestone.description,
    requiredVisits: milestone.visits,
    tokenMint: mockMint,
    metadata,
    unlockedAt: new Date().toISOString(),
    transactionSignature: mockSignature,
    verified: true
  };
  
  // Save to localStorage
  saveAchievement(achievement);
  
  // ICP Validation - Simulate validation through ICP canister
  try {
    const icpValidation = await validateAchievementOnICP(achievement);
    achievement.verified = icpValidation.success;
    if (icpValidation.transactionSignature) {
      achievement.transactionSignature = icpValidation.transactionSignature;
    }
    console.log('✅ Achievement validated on ICP:', achievement.name);
  } catch (error) {
    console.error('❌ ICP validation failed:', error);
    // Achievement still saved locally even if ICP validation fails
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return achievement;
}

// ICP validation function
async function validateAchievementOnICP(achievement: Achievement): Promise<{ success: boolean; transactionSignature?: string }> {
  // This would be a real call to your ICP canister
  // For now, we'll simulate the validation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionSignature: `icp_tx_${Date.now()}_${achievement.id}`
      });
    }, 500);
  });
}

// Real Solana minting function via ICP bridge
async function mintAchievementOnSolana(
  achievement: Achievement,
  wallet: any,
  connection: any // Connection type commented out until Solana deps are installed
): Promise<Achievement> {
  try {
    // Import ICP bridge functions
    const { 
      validateAchievementOnICP, 
      mintAchievementOnSolanaViaICP
    } = await import('./icp-bridge');
    
    // Prepare achievement data for ICP
    const achievementData: ICPAchievementData = {
      userId: wallet?.publicKey?.toString() || 'unknown',
      achievementId: achievement.id,
      achievementName: achievement.name,
      requiredVisits: achievement.requiredVisits,
      currentVisits: getCurrentVisitCount(),
      timestamp: new Date().toISOString(),
      walletAddress: wallet?.publicKey?.toString() || 'unknown'
    };
    
    // Validate achievement on ICP
    const isValid = await validateAchievementOnICP(achievementData);
    if (!isValid) {
      throw new Error('Achievement validation failed on ICP');
    }
    
    // Prepare minting request
    const mintingRequest: ICPMintingRequest = {
      achievementData,
      metadata: achievement.metadata
    };
    
    // Request Solana minting via ICP
    const mintingResponse = await mintAchievementOnSolanaViaICP(mintingRequest);
    
    if (!mintingResponse.success) {
      throw new Error(mintingResponse.error || 'Minting failed');
    }
    
    // Update achievement with real minting data
    const updatedAchievement: Achievement = {
      ...achievement,
      tokenMint: mintingResponse.tokenMint,
      transactionSignature: mintingResponse.transactionSignature,
      verified: true
    };
    
    // Save updated achievement
    saveAchievement(updatedAchievement);
    
    return updatedAchievement;
  } catch (error) {
    console.error('ICP bridge minting failed:', error);
    // Fallback to mock minting for demo
    return await mintAchievement({
      visits: achievement.requiredVisits,
      name: achievement.name,
      description: achievement.description
    });
  }
}

// Get progress towards next achievement
function getProgressToNextAchievement(): { current: number; next: number; progress: number } {
  const currentVisits = getCurrentVisitCount();
  
  for (const milestone of ACHIEVEMENT_MILESTONES) {
    if (currentVisits < milestone.visits) {
      const previousMilestone = ACHIEVEMENT_MILESTONES.find(m => m.visits < milestone.visits)?.visits || 0;
      const progress = ((currentVisits - previousMilestone) / (milestone.visits - previousMilestone)) * 100;
      
      return {
        current: currentVisits,
        next: milestone.visits,
        progress: Math.min(progress, 100)
      };
    }
  }
  
  // All achievements unlocked
  return {
    current: currentVisits,
    next: 270,
    progress: 100
  };
}

export {
  getAllUserAchievements,
  getProgressToNextAchievement,
  checkAndMintAchievements,
  ACHIEVEMENT_MILESTONES,
  mintAchievementOnSolana
}; 