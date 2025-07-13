# TubeHacks - London Underground Achievements

**Version:** 2.0.0  
**Team:** MAJKL  
**Event:** BrunelHack 2025

## 🚇 Overview

TubeHacks is a gamified London Underground exploration platform that rewards users for visiting tube stations with blockchain-based achievements and tokens. Built with Next.js, ICP (Internet Computer Protocol), and Solana integration, it features real-time station verification, achievement milestones, and cross-chain token minting.

## ✨ Key Features

### 🏆 Achievement System
- **10 Milestone Achievements**: From "First Steps" (1 station) to "Tube Completionist" (270 stations)
- **Rarity Levels**: Common, Uncommon, Rare, Epic, Legendary, Mythic
- **Visual Badges**: Auto-generated SVG achievement images with rarity-based styling
- **Progress Tracking**: Real-time progress bars and milestone notifications

### 🔗 ICP Integration
- **Achievements Canister**: Validates and stores achievement data on ICP
- **Solana Bridge Canister**: Handles cross-chain token minting
- **Decentralized Storage**: All achievement metadata stored on ICP
- **Real-time Validation**: Achievements validated through ICP canisters

### 💰 Solana Token System
- **Station Tokens**: Mint tokens for each verified station visit
- **Achievement Tokens**: Special tokens for milestone achievements
- **Cross-chain Integration**: Solana tokens minted via ICP bridge
- **Wallet Integration**: Phantom wallet support for token management

### 🗺️ Interactive Tube Map
- **D3.js Visualization**: Interactive London Underground map
- **Station Markers**: Click to verify and earn tokens
- **Geolocation**: Real-time user location tracking
- **Responsive Design**: Works on desktop and mobile

### 📱 Modern UI/UX
- **Dark/Light Theme**: Automatic theme switching
- **Achievement Notifications**: Popup notifications for new achievements
- **ICP Status Indicator**: Real-time connection status
- **Mobile Responsive**: Optimized for all screen sizes

## 🏗️ Architecture

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **D3.js**: Interactive data visualization

### Backend & Blockchain
- **ICP Canisters**: Rust-based smart contracts
- **Solana**: Token minting and transactions
- **AI Verification**: Station photo validation
- **Local Storage**: Achievement persistence

### Data Flow
```
User Visit → Photo Capture → AI Verification → ICP Validation → Solana Minting → Achievement Unlock
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust (for ICP canisters)
- DFX (Internet Computer SDK)
- Phantom Wallet

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MAJKL-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Start ICP replica**
```bash
source "$HOME/Library/Application Support/org.dfinity.dfx/env"
dfx start --clean --background
```

4. **Deploy ICP canisters**
```bash
dfx deploy
```

5. **Start development server**
```bash
npm run dev
```

6. **Open the application**
```
http://localhost:9002
```

## 🎯 How It Works

### Station Verification Process
1. **Visit a Station**: Navigate to any London Underground station
2. **Take a Photo**: Capture a photo with the station in view
3. **AI Verification**: Our AI validates the photo authenticity
4. **ICP Validation**: Achievement data is validated on ICP canisters
5. **Token Minting**: Solana tokens are minted via ICP bridge
6. **Achievement Check**: System checks for milestone achievements

### Achievement Milestones
| Visits | Achievement | Rarity | Description |
|--------|-------------|--------|-------------|
| 1 | First Steps | Common | Visit your first tube station |
| 10 | Getting Around | Uncommon | Visit 10 tube stations |
| 25 | Tube Explorer | Uncommon | Visit 25 tube stations |
| 50 | London Navigator | Rare | Visit 50 tube stations |
| 75 | Underground Veteran | Rare | Visit 75 tube stations |
| 100 | Metro Master | Epic | Visit 100 tube stations |
| 150 | Tube Network Expert | Epic | Visit 150 tube stations |
| 200 | London Underground Legend | Legendary | Visit 200 tube stations |
| 250 | Almost There | Legendary | Visit 250 tube stations |
| 270 | Tube Completionist | Mythic | Visit all 270 tube stations |

### ICP Integration Features
- **Achievements Canister**: Stores and validates achievement data
- **Solana Bridge Canister**: Handles cross-chain token minting
- **Real-time Validation**: All achievements validated through ICP
- **Decentralized Storage**: No central database required
- **Canister UI**: Direct access to canister interfaces

## 🛠️ Development

### Project Structure
```
MAJKL-1/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── sidebar/           # Sidebar components
│   │   ├── map/               # Map-related components
│   │   └── providers/         # Context providers
│   ├── lib/                   # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── backend/               # ICP canisters
│       ├── achievements/      # Achievements canister
│       └── solana_bridge/     # Solana bridge canister
├── dfx.json                   # ICP project configuration
├── Cargo.toml                 # Rust workspace
└── deploy-icp.sh             # Deployment script
```

### Key Components

#### ICP Status Indicator
- Real-time connection status to ICP canisters
- Floating indicator in top-right corner
- Links to canister UI interfaces

#### Achievement System
- Automatic milestone detection
- Visual achievement badges
- Progress tracking
- Notification system

#### Station Verification
- Photo capture and validation
- AI-based authenticity checking
- Token minting on verification
- Achievement triggering

### ICP Canisters

#### Achievements Canister (`src/backend/achievements/`)
```rust
// Validates and stores achievement data
pub struct AchievementData {
    pub user_id: String,
    pub achievement_id: String,
    pub achievement_name: String,
    pub required_visits: u32,
    pub current_visits: u32,
    pub timestamp: String,
    pub wallet_address: String,
}
```

#### Solana Bridge Canister (`src/backend/solana_bridge/`)
```rust
// Handles cross-chain token minting
pub struct AchievementMintingRequest {
    pub achievement_id: String,
    pub user_wallet: String,
    pub metadata_uri: String,
}
```

## 🔧 Configuration

### Environment Variables
```bash
# ICP Configuration
DFX_NETWORK=local
CANISTER_ID_ACHIEVEMENTS=uxrrr-q7777-77774-qaaaq-cai
CANISTER_ID_SOLANA_BRIDGE=u6s2n-gx777-77774-qaaba-cai

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### ICP Deployment
```bash
# Deploy to local network
dfx deploy

# Deploy to mainnet
dfx deploy --network ic
```

## 🎨 UI Features

### Achievement Display
- **Progress Cards**: Show progress to next achievement
- **Achievement List**: All unlocked achievements with details
- **Rarity Badges**: Color-coded rarity indicators
- **ICP Verification**: Shows ICP validation status

### Interactive Map
- **Station Markers**: Clickable station points
- **Geolocation**: Real-time user location
- **Fog of War**: Reveals visited stations
- **Responsive Design**: Works on all devices

### Sidebar Components
- **User Profile**: Shows collected badges and stats
- **Station Verification**: Photo capture and validation
- **ICP Status**: Connection status and canister info
- **Achievement Progress**: Real-time progress tracking

## 🔒 Security & Privacy

### Data Protection
- **No PII Storage**: Only achievement metadata stored
- **Local Storage**: User data stays on device
- **ICP Encryption**: Canister data is encrypted
- **Wallet Security**: Phantom wallet handles keys

### Verification Process
- **AI Validation**: Photo authenticity checking
- **ICP Validation**: Achievement verification on canisters
- **Multi-layer Security**: Multiple validation steps
- **Audit Trail**: All actions logged on blockchain

## 🚀 Deployment

### Local Development
```bash
# Start all services
npm run dev          # Next.js frontend
dfx start --clean    # ICP replica
dfx deploy           # Deploy canisters
```

### Production Deployment
```bash
# Deploy to mainnet
./deploy-icp.sh

# Build and deploy frontend
npm run build
npm run start
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: Auto-generated SVG achievements
- **Caching**: Local storage for achievements
- **Real-time Updates**: WebSocket-like updates

### Scalability
- **ICP Auto-scaling**: Canisters scale automatically
- **Solana TPS**: High transaction throughput
- **CDN Ready**: Static assets optimized
- **Mobile Optimized**: Responsive design

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic achievement system
- ✅ ICP integration
- ✅ Solana token minting
- ✅ Interactive tube map
- ✅ Achievement notifications

### Phase 2 (Planned)
- 🔄 Multi-city support
- 🔄 Social features
- 🔄 Leaderboards
- 🔄 Team challenges
- 🔄 Premium features

### Phase 3 (Future)
- 🔮 AR integration
- 🔮 Voice commands
- 🔮 AI-powered recommendations
- 🔮 Cross-chain NFTs
- 🔮 DAO governance

## 📞 Support

### Getting Help
- **Documentation**: Check the code comments
- **Issues**: Report bugs on GitHub
- **Discussions**: Join our community
- **Email**: Contact the team

### Resources
- [ICP Documentation](https://internetcomputer.org/docs)
- [Solana Documentation](https://docs.solana.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BrunelHack 2025**: For the hackathon opportunity
- **ICP Foundation**: For the Internet Computer platform
- **Solana Labs**: For the blockchain infrastructure
- **London Underground**: For the station data and inspiration

---

**Built with ❤️ by Team MAJKL for BrunelHack 2025**
