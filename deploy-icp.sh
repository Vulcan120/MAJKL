#!/bin/bash

# Deploy ICP Canisters for TubeHacks Achievements System

echo "🚀 Deploying ICP Canisters for TubeHacks..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx not found. Please install the Internet Computer SDK:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Start local replica
echo "📡 Starting local ICP replica..."
dfx start --background --clean

# Wait for replica to be ready
echo "⏳ Waiting for replica to be ready..."
sleep 10

# Deploy canisters
echo "🏗️  Building and deploying canisters..."

# Build achievements canister
echo "📦 Building achievements canister..."
dfx build achievements

# Build solana bridge canister
echo "📦 Building solana bridge canister..."
dfx build solana_bridge

# Deploy achievements canister
echo "🚀 Deploying achievements canister..."
dfx deploy achievements

# Deploy solana bridge canister
echo "🚀 Deploying solana bridge canister..."
dfx deploy solana_bridge

# Get canister IDs
echo "📋 Canister IDs:"
dfx canister id achievements
dfx canister id solana_bridge

echo "✅ Deployment complete!"
echo "🌐 Local replica: http://localhost:8000"
echo "📊 Canister dashboard: http://localhost:8000/_/dashboard"

# Optional: Deploy to mainnet
read -p "Do you want to deploy to mainnet? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to mainnet..."
    dfx deploy --network ic achievements
    dfx deploy --network ic solana_bridge
    
    echo "✅ Mainnet deployment complete!"
    echo "🌐 Mainnet canister IDs:"
    dfx canister --network ic id achievements
    dfx canister --network ic id solana_bridge
fi 