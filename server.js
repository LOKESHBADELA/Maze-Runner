const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

// ============= MAZE GENERATION =============
// 5 Predefined Hard Mazes (15x15 perfect mazes)
const PREDEFINED_MAZES = [
  // Maze 1: Spiral Pattern
  {
    width: 15,
    height: 15,
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,0,1,1,1,1,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 }
  },
  
  // Maze 2: Long Corridor
  {
    width: 15,
    height: 15,
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 }
  },
  
  // Maze 3: Cross Pattern
  {
    width: 15,
    height: 15,
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
      [1,0,0,0,1,1,1,1,1,1,1,0,0,0,1],
      [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 }
  },
  
  // Maze 4: Zigzag
  {
    width: 15,
    height: 15,
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 }
  },
  
  // Maze 5: Complex Web
  {
    width: 15,
    height: 15,
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
      [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1],
      [1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 }
  }
];

// ============= SERVER SETUP =============
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============= GAME STATE =============
class GameState {
  constructor() {
    this.players = new Map(); // playerId -> playerData
    this.currentMaze = null;
    this.gameStartTime = null;
    this.gameTimer = 0;
    this.gameActive = false;
    this.winner = null;
    this.timerInterval = null;
  }

  addPlayer(playerId, playerName, color) {
    const playerData = {
      id: playerId,
      name: playerName,
      color: color,
      position: null,
      connected: true,
      lastHeartbeat: Date.now(),
      // timeOffset: 0 // Add this
    };
    this.players.set(playerId, playerData);
    return playerData;
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.connected = false;
    }
  }

  reconnectPlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.connected = true;
      player.lastHeartbeat = Date.now();
    }
  }

  startGame() {
    // Select random maze
    const mazeIndex = Math.floor(Math.random() * PREDEFINED_MAZES.length);
    this.currentMaze = PREDEFINED_MAZES[mazeIndex];
    
    // Initialize all players at start position
    this.players.forEach(player => {
      player.position = { ...this.currentMaze.start };
    });

    this.gameStartTime = Date.now();
    this.gameTimer = 0;
    this.gameActive = true;
    this.winner = null;

    // Start global timer
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (this.gameActive) {
        this.gameTimer = Math.floor((Date.now() - this.gameStartTime) / 1000);
        // Broadcast timer update to all clients
        broadcast({
          type: 'TIMER_UPDATE',
          timer: this.gameTimer
        });
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  movePlayer(playerId, direction) {
    if (!this.gameActive || this.winner) return false;

    const player = this.players.get(playerId);
    if (!player || !player.position) return false;

    const newPos = { ...player.position };

    // Calculate new position based on direction
    switch (direction) {
      case 'UP': newPos.y -= 1; break;
      case 'DOWN': newPos.y += 1; break;
      case 'LEFT': newPos.x -= 1; break;
      case 'RIGHT': newPos.x += 1; break;
      default: return false;
    }

    // Validate move (check boundaries and walls)
    if (!this.isValidMove(newPos)) {
      return false;
    }

    // Update player position
    player.position = newPos;

    // Check if player reached exit
    if (this.checkWin(newPos)) {
      this.winner = player;
      this.gameActive = false;
      this.stopTimer();
      return 'WIN';
    }

    return true;
  }

  isValidMove(pos) {
    if (!this.currentMaze) return false;

    const { x, y } = pos;
    const { width, height, grid } = this.currentMaze;

    // Check boundaries
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    // Check if position is not a wall (0 = path, 1 = wall)
    return grid[y][x] === 0;
  }

  checkWin(pos) {
    if (!this.currentMaze) return false;
    const { exit } = this.currentMaze;
    return pos.x === exit.x && pos.y === exit.y;
  }

  getState() {
    return {
      maze: this.currentMaze,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        position: p.position,
        connected: p.connected
      })),
      gameActive: this.gameActive,
      timer: this.gameTimer,
      winner: this.winner ? {
        id: this.winner.id,
        name: this.winner.name,
        color: this.winner.color
      } : null
    };
  }

  resetGame() {
    this.stopTimer();
    this.currentMaze = null;
    this.gameStartTime = null;
    this.gameTimer = 0;
    this.gameActive = false;
    this.winner = null;
    
    // Reset player positions
    this.players.forEach(player => {
      player.position = null;
    });
  }
}

const gameState = new GameState();

// ============= WEBSOCKET HANDLERS =============
const clients = new Map(); // ws -> playerId

function broadcast(message, excludeClient = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((playerId, client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function sendToClient(client, message) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

// Player colors
const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];
let colorIndex = 0;

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const playerId = clients.get(ws);
    if (playerId) {
      console.log(`Player ${playerId} disconnected`);
      gameState.removePlayer(playerId);
      clients.delete(ws);

      // Notify other players
      broadcast({
        type: 'PLAYER_DISCONNECTED',
        playerId: playerId,
        state: gameState.getState()
      });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, data) {
  const { type, payload } = data;

  switch (type) {
    case 'JOIN_GAME': {
      const { playerName, playerId } = payload;
      
      // Check if player is reconnecting
      let player;
      if (playerId && gameState.players.has(playerId)) {
        player = gameState.players.get(playerId);
        gameState.reconnectPlayer(playerId);
        console.log(`Player ${playerName} reconnected`);
      } else {
        // New player
        const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
        colorIndex++;
        
        player = gameState.addPlayer(newPlayerId, playerName, color);
        console.log(`Player ${playerName} joined with ID ${newPlayerId}`);
      }

      clients.set(ws, player.id);

      // Send player their ID and current game state
      sendToClient(ws, {
        type: 'JOINED',
        playerId: player.id,
        state: gameState.getState()
      });

      // Notify other players
      broadcast({
        type: 'PLAYER_JOINED',
        player: {
          id: player.id,
          name: player.name,
          color: player.color,
          position: player.position,
          connected: player.connected
        },
        state: gameState.getState()
      }, ws);

      break;
    }

    case 'START_GAME': {
      if (gameState.players.size >= 2) {
        gameState.startGame();
        
        broadcast({
          type: 'GAME_STARTED',
          state: gameState.getState()
        });
        
        console.log('Game started with maze:', gameState.currentMaze);
      } else {
        sendToClient(ws, {
          type: 'ERROR',
          message: 'Need at least 2 players to start'
        });
      }
      break;
    }

    case 'MOVE': {
      const playerId = clients.get(ws);
      const { direction } = payload;
      
      const result = gameState.movePlayer(playerId, direction);
      
      if (result === 'WIN') {
        // Player won!
        broadcast({
          type: 'GAME_OVER',
          state: gameState.getState()
        });
      } else if (result) {
        // Valid move
        broadcast({
          type: 'PLAYER_MOVED',
          state: gameState.getState()
        });
      } else {
        // Invalid move - send error to player
        sendToClient(ws, {
          type: 'INVALID_MOVE',
          message: 'Cannot move in that direction'
        });
      }
      break;
    }

    case 'RESET_GAME': {
      gameState.resetGame();
      broadcast({
        type: 'GAME_RESET',
        state: gameState.getState()
      });
      break;
    }

    case 'HEARTBEAT': {
      const playerId = clients.get(ws);
      if (playerId) {
        const player = gameState.players.get(playerId);
        if (player) {
          player.lastHeartbeat = Date.now();
        }
      }
      break;
    }

    case 'TIME_RESPONSE': {
      const playerId = clients.get(ws);
      const { clientTime, receivedServerTime } = payload;
      // clockSync.handleTimeResponse(playerId, clientTime, receivedServerTime);
      break;
    }

    default:
      console.log('Unknown message type:', type);
  }
}

// ============= FAULT TOLERANCE - Heartbeat Monitor =============
setInterval(() => {
  const now = Date.now();
  const TIMEOUT = 30000; // 30 seconds

  gameState.players.forEach((player, playerId) => {
    if (player.connected && (now - player.lastHeartbeat) > TIMEOUT) {
      console.log(`Player ${player.name} timed out`);
      gameState.removePlayer(playerId);
      
      broadcast({
        type: 'PLAYER_DISCONNECTED',
        playerId: playerId,
        state: gameState.getState()
      });
    }
  });
}, 10000); // Check every 10 seconds

// ============= CLOCK SYNCHRONIZATION (Berkeley Algorithm) =============
// class ClockSync {
//   constructor(gameState, broadcast) {
//     this.gameState = gameState;
//     this.broadcast = broadcast;
//     this.syncInterval = null;
//     this.pendingResponses = new Map(); // playerId -> { serverTime, responseTime }
//   }

  // startSync(interval = 30000) { // Sync every 30 seconds
  //   this.stopSync();
  //   this.syncInterval = setInterval(() => {
  //     this.requestTimes();
  //   }, interval);
  // }

  // stopSync() {
  //   if (this.syncInterval) {
  //     clearInterval(this.syncInterval);
  //     this.syncInterval = null;
  //   }
  // }

  // requestTimes() {
  //   const serverTime = Date.now();
  //   this.pendingResponses.clear();

  //   // Send time request to all connected players
  //   this.broadcast({
  //     type: 'TIME_REQUEST',
  //     serverTime: serverTime
  //   });

  //   // Set a timeout to process responses after 5 seconds
  //   setTimeout(() => {
  //     this.processResponses(serverTime);
  //   }, 5000);
  // }

  // handleTimeResponse(playerId, clientTime, receivedServerTime) {
  //   if (this.pendingResponses.has(playerId)) {
  //     this.pendingResponses.set(playerId, {
  //       clientTime: clientTime,
  //       receivedServerTime: receivedServerTime
  //     });
  //   }
  // }

//   processResponses(originalServerTime) {
//     const offsets = [];
//     const now = Date.now();

//     this.pendingResponses.forEach((response, playerId) => {
//       const { clientTime, receivedServerTime } = response;
//       // Estimate round-trip time (RTT) and offset
//       const rtt = now - originalServerTime;
//       const offset = clientTime - (receivedServerTime + rtt / 2);
//       offsets.push(offset);

//       // Store offset in player data
//       const player = this.gameState.players.get(playerId);
//       if (player) {
//         player.timeOffset = offset;
//       }
//     });

//     if (offsets.length > 0) {
//       // Calculate average offset
//       const averageOffset = offsets.reduce((sum, off) => sum + off, 0) / offsets.length;

//       // Send adjustment to all players
//       this.broadcast({
//         type: 'TIME_ADJUST',
//         adjustment: -averageOffset // Negative to adjust towards average
//       });
//     }
//   }
// }

// const clockSync = new ClockSync(gameState, broadcast);

// ============= START SERVER =============
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   Distributed Multiplayer Maze Escape Game       ║
║   Server running on port ${PORT}                     ║
║                                                   ║
║   Open http://localhost:${PORT} in your browser    ║
║   Open on multiple devices to play together!     ║
╚═══════════════════════════════════════════════════╝
  `);
  // clockSync.startSync(); // Start clock synchronization
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  gameState.stopTimer();
  // clockSync.stopSync(); // Stop clock sync
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
