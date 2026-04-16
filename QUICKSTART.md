# 🚀 Quick Start Guide

Get the Distributed Multiplayer Maze Escape Game running in 5 minutes!

## Prerequisites

- **Node.js** v14 or higher ([Download here](https://nodejs.org/))
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Installation (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `ws` - WebSocket library for real-time communication
- `express` - Web server framework

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════╗
║   Distributed Multiplayer Maze Escape Game       ║
║   Server running on port 3000                     ║
║                                                   ║
║   Open http://localhost:3000 in your browser     ║
║   Open on multiple devices to play together!     ║
╚═══════════════════════════════════════════════════╝
```

### Step 3: Play!

**Option A: Single Device (Testing)**
1. Open **two browser tabs**: http://localhost:3000
2. Enter different names in each tab
3. Click "JOIN GAME" in both
4. Click "START GAME"
5. Use arrow keys to move! 🎮

**Option B: Multiple Devices (Real Multiplayer)**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   Look for something like `192.168.1.100`

2. On other devices (phone, tablet, another laptop):
   - Connect to the **same WiFi network**
   - Open browser to `http://[YOUR_IP]:3000`
   - Example: `http://192.168.1.100:3000`

3. Each player:
   - Enter name
   - Join game
   - Start playing!

## Game Controls

### Desktop
- **Arrow Keys**: ↑ ↓ ← →
- **WASD**: W/A/S/D
- **Click**: On-screen buttons

### Mobile
- **Tap**: On-screen directional buttons

## Objective

🎯 **First player to reach the yellow star (★) wins!**

- Navigate through the maze
- Avoid walls (dark blue)
- See other players in real-time
- Race to the exit!

## Tips

💡 **Start with 2 players minimum**
- Game won't start with just 1 player
- Add more for competitive fun!

💡 **Each game has a random maze**
- 5 different challenging mazes
- New maze selected each game

💡 **Connection issues?**
- Check top-right corner for connection status
- Green "CONNECTED" = good to go
- Red "DISCONNECTED" = network problem

💡 **Game stuck?**
- Click "RESET" to start over
- Refresh browser if needed

## Troubleshooting

### ❌ "Cannot connect to server"
**Solution**: Ensure server is running with `npm start`

### ❌ "Need at least 2 players to start"
**Solution**: Open game in 2+ browser windows/devices

### ❌ Can't move
**Solution**: Make sure game is started (status shows "PLAYING")

### ❌ Other devices can't connect
**Solution**: 
- Verify all devices on same WiFi
- Check firewall isn't blocking port 3000
- Use correct IP address

## What's Next?

### Learn More
- Read `README.md` for detailed documentation
- Check `ARCHITECTURE.md` for system design
- Explore the code in `server.js` and `public/game.js`

### Distributed Systems Concepts Demonstrated
✅ Client-Server Model  
✅ Real-time Event Broadcasting  
✅ Concurrency Control  
✅ Clock Synchronization  
✅ Consistency Across Clients  
✅ Fault Tolerance (Reconnection)  

### Customize
- Modify `PREDEFINED_MAZES` in `server.js` to add new mazes
- Change colors in `public/index.html` CSS variables
- Adjust timer interval, player count limits, etc.

## Support

Having issues? Check:
1. Node.js version: `node --version` (should be v14+)
2. Server logs in terminal for error messages
3. Browser console (F12) for client errors
4. README.md troubleshooting section

---

**Enjoy the game! 🎮⚡**

*First to escape wins!*
