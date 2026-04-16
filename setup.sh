#!/bin/bash

# Distributed Multiplayer Maze Escape Game - Setup Script

echo "╔═══════════════════════════════════════════════════╗"
echo "║   Distributed Multiplayer Maze Escape Game       ║"
echo "║   Installation Script                             ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js v14 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version is too old (v$NODE_VERSION)."
    echo "Please upgrade to Node.js v14 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Ready to play!                                  ║"
echo "║                                                   ║"
echo "║   To start the server:                            ║"
echo "║   npm start                                       ║"
echo "║                                                   ║"
echo "║   Then open in browser:                           ║"
echo "║   http://localhost:3000                           ║"
echo "║                                                   ║"
echo "║   For multi-device play:                          ║"
echo "║   See QUICKSTART.md                               ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
