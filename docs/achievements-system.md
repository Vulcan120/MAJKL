# Achievements System

## Overview

The Achievements System is a gamification feature that rewards users for visiting tube stations. Users earn achievement tokens on the Solana blockchain through ICP (Internet Computer) as a bridge, creating a secure and decentralized verification system.

## Features

### Achievement Milestones
- **First Steps** (1 station): Visit your first tube station
- **Getting Around** (10 stations): Visit 10 tube stations
- **Tube Explorer** (25 stations): Visit 25 tube stations
- **London Navigator** (50 stations): Visit 50 tube stations
- **Underground Veteran** (75 stations): Visit 75 tube stations
- **Metro Master** (100 stations): Visit 100 tube stations
- **Tube Network Expert** (150 stations): Visit 150 tube stations
- **London Underground Legend** (200 stations): Visit 200 tube stations
- **Almost There** (250 stations): Visit 250 tube stations
- **Tube Completionist** (270 stations): Visit all 270 tube stations

### Rarity Levels
- **Common**: 1 visit
- **Uncommon**: 2-25 visits
- **Rare**: 26-100 visits
- **Epic**: 101-200 visits
- **Legendary**: 201-250 visits
- **Mythic**: 270 visits (completionist)

## Architecture

### Frontend Components
- `src/lib/achievements-system.ts`: Core achievements logic
- `src/components/sidebar/achievements.tsx`: UI component for displaying achievements
- `src/lib/icp-bridge.ts`: ICP bridge interface

### Integration Points
- **Station Verification**: Automatically checks for achievements after successful station verification
- **User Profile**: Displays achievements and progress in the sidebar
- **Token System**: Integrates with existing station token system

## Technical Implementation

### Achievement Data Structure
```typescript
interface Achievement {
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
```

### ICP Bridge Integration
The system uses ICP as a bridge for:
1. **Achievement Validation**: Validates achievement criteria on ICP canisters
2. **Solana Minting**: ICP canisters create and execute Solana transactions
3. **Data Storage**: Stores achievement history on ICP
4. **Security**: Provides decentralized verification

### Flow Diagram
```
User visits station
    ↓
Station verification (AI)
    ↓
Station token minted
    ↓
Check for achievements
    ↓
Validate on ICP canister
    ↓
Mint achievement token on Solana
    ↓
Store achievement data
    ↓
Update UI
```

## Usage

### Automatic Achievement Checking
Achievements are automatically checked after each successful station verification:

```typescript
// In station verification component
const unlockedAchievements = await checkAndMintAchievements();
if (unlockedAchievements.length > 0) {
  // Show achievement notification
  toast({
    title: `🏆 Achievement Unlocked!`,
    description: `You've unlocked ${unlockedAchievements.length} new achievement(s)!`,
    className: 'bg-yellow-500 text-white'
  });
}
```

### Manual Achievement Checking
```typescript
import { checkAndMintAchievements } from '@/lib/achievements-system';

const achievements = await checkAndMintAchievements();
console.log('Unlocked achievements:', achievements);
```

### Progress Tracking
```typescript
import { getProgressToNextAchievement } from '@/lib/achievements-system';

const progress = getProgressToNextAchievement();
console.log(`Progress: ${progress.current}/${progress.next} (${progress.progress}%)`);
```

## UI Components

### Achievements Component
The achievements component displays:
- Progress bar to next achievement
- List of unlocked achievements
- Achievement details modal
- Rarity badges and icons

### Integration with User Profile
Achievements are displayed in the user profile sidebar alongside:
- Station tokens
- Theme selection
- User statistics

## Future Enhancements

### Planned Features
1. **Achievement Categories**: Different types of achievements (speed, efficiency, etc.)
2. **Time-based Achievements**: Achievements for visiting stations within time limits
3. **Social Features**: Achievement sharing and leaderboards
4. **Special Events**: Limited-time achievement events
5. **Achievement Trading**: NFT marketplace for achievement tokens

### Technical Improvements
1. **Real ICP Integration**: Replace mock ICP bridge with actual canister calls
2. **Solana Program**: Deploy custom Solana program for achievement tokens
3. **Metadata Storage**: Store achievement metadata on IPFS
4. **Cross-chain Support**: Support for multiple blockchains
5. **Analytics**: Achievement analytics and insights

## Security Considerations

### Validation
- All achievements are validated on ICP canisters
- Duplicate achievement prevention
- Anti-cheat mechanisms

### Privacy
- Minimal data stored on-chain
- User consent for data sharing
- GDPR compliance

### Scalability
- ICP auto-scaling for high load
- Efficient Solana transaction batching
- Caching for frequently accessed data

## Development

### Local Development
1. Start the development server
2. Connect wallet
3. Verify stations to trigger achievements
4. Check achievements in user profile

### Testing
```bash
# Run tests
npm test

# Test achievement logic
npm run test:achievements

# Test ICP bridge
npm run test:icp-bridge
```

### Deployment
1. Deploy ICP canisters
2. Deploy Solana programs
3. Update configuration
4. Deploy frontend

## Configuration

### Environment Variables
```env
# ICP Configuration
ICP_CANISTER_ID=your-canister-id
ICP_NETWORK=mainnet

# Solana Configuration
SOLANA_RPC_URL=your-rpc-url
SOLANA_PROGRAM_ID=your-program-id

# Achievement Configuration
ACHIEVEMENT_ENABLED=true
MOCK_MINTING=false
```

### Achievement Settings
```typescript
// Customize achievement milestones
export const ACHIEVEMENT_MILESTONES = [
  { visits: 1, name: "First Steps", description: "Visit your first tube station" },
  // Add more milestones...
];
```

## Troubleshooting

### Common Issues
1. **Achievements not unlocking**: Check visit count and achievement criteria
2. **ICP connection failed**: Verify canister ID and network settings
3. **Solana minting failed**: Check wallet connection and RPC endpoint
4. **UI not updating**: Refresh page or check localStorage

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('debug-achievements', 'true');
```

## Contributing

### Adding New Achievements
1. Add milestone to `ACHIEVEMENT_MILESTONES`
2. Update achievement metadata generation
3. Test achievement unlocking
4. Update documentation

### ICP Bridge Development
1. Implement actual ICP canister calls
2. Add error handling and retry logic
3. Test with real ICP network
4. Update bridge interface

### UI Improvements
1. Add new achievement display components
2. Improve progress visualization
3. Add achievement animations
4. Enhance mobile experience 