# Distributed Systems Concepts Explained

This document explains how the Maze Escape game demonstrates key distributed systems concepts.

## Table of Contents
1. [Client-Server Model](#1-client-server-model)
2. [Event Broadcasting](#2-event-broadcasting)
3. [Concurrency Control](#3-concurrency-control)
4. [Clock Synchronization](#4-clock-synchronization)
5. [Consistency](#5-consistency)
6. [Fault Tolerance](#6-fault-tolerance)

---

## 1. Client-Server Model

### What is it?
A distributed architecture where:
- **Server**: Centralized authority managing shared resources and state
- **Clients**: Request services and display information to users

### How it's implemented in our game:

#### Server Responsibilities (server.js)
```javascript
class GameState {
  // Server owns the authoritative state
  players: Map<playerId, PlayerData>
  currentMaze: Maze
  gameActive: boolean
  winner: Player | null
  
  // Server processes all game logic
  movePlayer(id, direction) {
    // 1. Validate request
    // 2. Update state
    // 3. Broadcast to clients
  }
}
```

**What the server does:**
- ✅ Stores the **single source of truth** (game state)
- ✅ Validates all player moves
- ✅ Enforces game rules
- ✅ Detects winner
- ✅ Manages the global timer
- ✅ Handles player connections/disconnections

#### Client Responsibilities (public/game.js)
```javascript
class MazeGame {
  // Client only stores what it receives
  gameState: State | null
  
  // Client sends actions to server
  move(direction) {
    this.send('MOVE', { direction });
  }
  
  // Client renders state from server
  render() {
    drawMaze(this.gameState.maze);
    drawPlayers(this.gameState.players);
  }
}
```

**What clients do:**
- ✅ Capture user input (keyboard, touch)
- ✅ Send actions to server
- ✅ Receive state updates
- ✅ Render the game visually
- ✅ Display UI elements

### Why this matters:

**Advantages:**
- 🔒 **No cheating**: Server validates all moves
- 🎯 **Consistent state**: All clients see same data
- 🔧 **Easy to update**: Change logic in one place (server)
- 🎮 **Lightweight clients**: Browsers only need to render

**Real-world examples:**
- Multiplayer games (Fortnite, Among Us)
- Web applications (Gmail, Facebook)
- Banking systems
- Video streaming (Netflix)

---

## 2. Event Broadcasting

### What is it?
When one client performs an action, the server sends updates to **all connected clients** so everyone stays in sync.

### How it's implemented:

#### Broadcasting Function (server.js)
```javascript
function broadcast(message, excludeClient = null) {
  const messageStr = JSON.stringify(message);
  
  // Send to ALL connected clients
  clients.forEach((playerId, client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}
```

#### Example Flow:
```
1. Player 1 presses arrow key
   ↓
2. Client 1 sends: { type: 'MOVE', direction: 'UP' }
   ↓
3. Server receives and validates move
   ↓
4. Server updates Player 1's position
   ↓
5. Server broadcasts to ALL clients:
   { type: 'PLAYER_MOVED', state: {...} }
   ↓
6. Client 1, Client 2, Client 3... all receive update
   ↓
7. All clients re-render with new positions
```

### Events We Broadcast:

| Event | When | What Happens |
|-------|------|--------------|
| `PLAYER_JOINED` | New player connects | All clients add player to UI |
| `PLAYER_MOVED` | Any player moves | All clients update that player's position |
| `GAME_STARTED` | Game begins | All clients receive maze and start |
| `GAME_OVER` | Player wins | All clients show winner banner |
| `TIMER_UPDATE` | Every second | All clients update clock display |
| `PLAYER_DISCONNECTED` | Player leaves | All clients remove/gray out player |

### Why this matters:

**Without broadcasting:**
- ❌ Player 1 moves but Player 2 doesn't see it
- ❌ Players have different views of the game
- ❌ No real-time interaction

**With broadcasting:**
- ✅ All players see moves instantly
- ✅ Shared experience
- ✅ True multiplayer gameplay

**Real-world examples:**
- Chat applications (WhatsApp, Discord)
- Live collaborative editing (Google Docs)
- Stock tickers
- Social media feeds (Twitter, Instagram)

---

## 3. Concurrency Control

### What is it?
Managing multiple players performing actions **at the same time** without conflicts or race conditions.

### The Problem:
```
Time: 0.000s - Player 1 at (5, 5), Player 2 at (6, 5)
Time: 0.001s - Player 1 sends MOVE RIGHT to (6, 5)
Time: 0.001s - Player 2 sends MOVE LEFT to (5, 5)
Time: 0.002s - Server receives both moves

❌ Without concurrency control:
- Both players try to occupy same position
- State becomes inconsistent
- Game breaks!
```

### How it's implemented:

#### Sequential Processing (server.js)
```javascript
ws.on('message', (message) => {
  // Node.js processes messages ONE AT A TIME (event loop)
  const data = JSON.parse(message);
  handleMessage(ws, data);  // Processed sequentially
});

movePlayer(playerId, direction) {
  // ATOMIC operation - cannot be interrupted
  
  // 1. Lock: Only one move processed at a time
  if (!this.gameActive || this.winner) return false;
  
  // 2. Validate current state
  const player = this.players.get(playerId);
  if (!player || !player.position) return false;
  
  // 3. Calculate new position
  const newPos = { ...player.position };
  switch (direction) {
    case 'UP': newPos.y -= 1; break;
    // ...
  }
  
  // 4. Validate new position
  if (!this.isValidMove(newPos)) return false;
  
  // 5. Update state (atomic write)
  player.position = newPos;
  
  // 6. Check win condition
  if (this.checkWin(newPos)) {
    this.winner = player;
    this.gameActive = false;
    return 'WIN';
  }
  
  return true;
}
```

### Mechanisms We Use:

#### 1. Event Loop (Node.js)
- JavaScript is **single-threaded**
- Events processed **one at a time**
- No simultaneous state modifications

#### 2. Validation Before Update
```javascript
// Always check BEFORE changing state
if (!this.isValidMove(newPos)) {
  return false;  // Reject invalid move
}
player.position = newPos;  // Only update if valid
```

#### 3. Game State Flags
```javascript
if (!this.gameActive || this.winner) {
  return false;  // No moves allowed after game ends
}
```

### Why this matters:

**Race Condition Example:**
```javascript
// BAD CODE (race condition):
position = getPosition();
// ⚠️ Another player could move here ⚠️
if (isValid(position)) {
  setPosition(position);  // Might be invalid now!
}

// GOOD CODE (atomic):
if (isValid(position)) {
  setPosition(position);  // Check and update together
}
```

**Real-world examples:**
- Bank account transfers (prevent double-spending)
- Seat reservations (prevent double-booking)
- Inventory systems (prevent overselling)
- Traffic light coordination

---

## 4. Clock Synchronization

### What is it?
Ensuring all distributed clients agree on the current time/timer value.

### The Problem:
```
Client 1 (laptop):     Timer starts at 14:30:00.000
Client 2 (phone):      Timer starts at 14:30:00.150  (150ms later)
Client 3 (tablet):     Timer starts at 14:30:00.300  (300ms later)

After 10 seconds:
Client 1 shows: 00:10
Client 2 shows: 00:09
Client 3 shows: 00:09

❌ Inconsistent timer displays!
```

### How it's implemented:

#### Server as Time Authority (server.js)
```javascript
class GameState {
  startGame() {
    // Server records authoritative start time
    this.gameStartTime = Date.now();
    this.gameTimer = 0;
    this.gameActive = true;
    
    // Start the authoritative timer
    this.startTimer();
  }
  
  startTimer() {
    this.timerInterval = setInterval(() => {
      // Server calculates elapsed time
      this.gameTimer = Math.floor((Date.now() - this.gameStartTime) / 1000);
      
      // Broadcast to ALL clients
      broadcast({
        type: 'TIMER_UPDATE',
        timer: this.gameTimer
      });
    }, 1000);  // Every 1 second
  }
}
```

#### Client Displays Server Time (public/game.js)
```javascript
handleMessage(message) {
  if (message.type === 'TIMER_UPDATE') {
    // Don't calculate locally - use server's value
    this.updateTimer(message.timer);
  }
}

updateTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // Display server's authoritative time
  document.getElementById('gameTimer').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
```

### Why This Approach?

#### ❌ Don't do this (client-side timers):
```javascript
// BAD: Each client has its own timer
this.timer = 0;
setInterval(() => {
  this.timer++;  // Clients drift apart over time
  displayTimer(this.timer);
}, 1000);
```

#### ✅ Do this (server-authoritative):
```javascript
// GOOD: Server sends authoritative time
handleMessage({ type: 'TIMER_UPDATE', timer: 42 }) {
  displayTimer(42);  // All clients show exact same value
}
```

### Synchronization Guarantees:

**What we ensure:**
- ✅ All clients show **identical timer**
- ✅ Timer **never goes backwards**
- ✅ Timer **continues even if clients disconnect**
- ✅ Reconnecting clients get **current timer value**

**Edge cases handled:**
```javascript
// Client disconnects at 00:30
// Client reconnects at 00:45
handleMessage({ type: 'JOINED', state: { timer: 45 }}) {
  // Client immediately jumps to 00:45, not 00:30
  this.updateTimer(state.timer);
}
```

### Why this matters:

**Problems clock sync solves:**
- ⏰ Time-based events (game rounds, countdowns)
- 🏆 Fair leaderboards (accurate time comparisons)
- 🎮 Synchronized gameplay (everyone starts/ends together)
- 📊 Analytics (consistent timestamps)

**Real-world examples:**
- Online games (round timers)
- Auctions (bidding deadlines)
- Trading systems (market close times)
- GPS (requires nanosecond precision!)

---

## 5. Consistency

### What is it?
Ensuring all clients have the **same view of the game state** at all times.

### The Consistency Model:

```
SINGLE SOURCE OF TRUTH (Server)
         ↓
    STATE UPDATES
         ↓
    BROADCAST TO ALL
         ↓
ALL CLIENTS RENDER SAME STATE
```

### How it's implemented:

#### Server: Single State Object (server.js)
```javascript
class GameState {
  getState() {
    // Serialize complete state for clients
    return {
      maze: this.currentMaze,        // Same maze for everyone
      players: Array.from(this.players.values()),  // Same player positions
      gameActive: this.gameActive,   // Same game status
      timer: this.gameTimer,          // Same timer value
      winner: this.winner             // Same winner (or null)
    };
  }
}
```

#### Every Update Sends Full State:
```javascript
// After ANY change, broadcast complete state
broadcast({
  type: 'PLAYER_MOVED',
  state: gameState.getState()  // Complete snapshot
});
```

#### Clients Never Modify State:
```javascript
// BAD: Client predicts move
player.position.x += 1;  // ❌ Don't do this!
render();

// GOOD: Client waits for server
send('MOVE', { direction: 'RIGHT' });
// Server validates and broadcasts
// Client renders when it receives update
```

### Consistency Guarantees:

#### 1. **Same Maze**
```javascript
// Server selects ONE maze
const mazeIndex = Math.floor(Math.random() * 5);
this.currentMaze = PREDEFINED_MAZES[mazeIndex];

// ALL clients receive same maze
broadcast({ type: 'GAME_STARTED', state: { maze: this.currentMaze } });
```

#### 2. **Same Player Positions**
```javascript
// Server is only one that can move players
movePlayer(playerId, direction) {
  player.position = newPos;  // Authoritative update
  
  // ALL clients get updated positions
  broadcast({ type: 'PLAYER_MOVED', state: this.getState() });
}
```

#### 3. **Same Winner**
```javascript
// Server detects winner
if (this.checkWin(newPos)) {
  this.winner = player;  // Set once
  this.gameActive = false;
  
  // ALL clients notified simultaneously
  broadcast({ type: 'GAME_OVER', state: this.getState() });
}
```

### Preventing Inconsistency:

#### What NOT to do:
```javascript
// ❌ Client-side prediction without validation
client.position.x += 1;
if (hitWall()) {
  client.position.x -= 1;  // Whoops, now out of sync!
}
```

#### What we DO instead:
```javascript
// ✅ Client sends intent
send('MOVE', { direction: 'RIGHT' });

// ✅ Server validates and updates
if (isValid(newPos)) {
  player.position = newPos;
  broadcast(state);  // Everyone gets validated state
} else {
  send('INVALID_MOVE');  // Reject, no state change
}
```

### Why this matters:

**Without consistency:**
```
Client 1 sees: Player A at (5,5), Player B at (6,6)
Client 2 sees: Player A at (5,6), Player B at (6,5)
❌ Different realities = broken game!
```

**With consistency:**
```
All clients see: Player A at (5,5), Player B at (6,6)
✅ Shared reality = working multiplayer!
```

**Real-world examples:**
- Banking (account balances must match)
- E-commerce (inventory counts)
- Document editing (Google Docs)
- Databases (replicas stay in sync)

---

## 6. Fault Tolerance

### What is it?
The system continues working even when:
- Network connections drop
- Clients crash
- Messages get lost

### Fault Scenarios We Handle:

#### 1. **Network Disconnection**

**Problem:**
```
Player 1 is playing...
WiFi drops for 10 seconds...
Player 1 should rejoin seamlessly
```

**Solution: Heartbeat Monitoring**

Client side (public/game.js):
```javascript
startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.send('HEARTBEAT', {});  // Send every 10s
    }
  }, 10000);
}
```

Server side (server.js):
```javascript
// Monitor heartbeats every 10 seconds
setInterval(() => {
  const now = Date.now();
  const TIMEOUT = 30000;  // 30 second timeout
  
  gameState.players.forEach((player, playerId) => {
    if (player.connected && (now - player.lastHeartbeat) > TIMEOUT) {
      // No heartbeat for 30s = disconnect
      gameState.removePlayer(playerId);
      broadcast({ type: 'PLAYER_DISCONNECTED', playerId });
    }
  });
}, 10000);
```

**What happens:**
- ✅ Server detects missing heartbeats
- ✅ Marks player as disconnected
- ✅ Notifies other players
- ✅ Game continues for remaining players

#### 2. **Auto-Reconnection**

**Problem:**
```
Connection lost...
Player wants to rejoin automatically
```

**Solution: Exponential Backoff**

```javascript
attemptReconnect() {
  if (this.reconnectAttempts < 5) {
    this.reconnectAttempts++;
    
    // Wait: 3s, 6s, 9s, 12s, 15s
    const delay = 3000 * this.reconnectAttempts;
    
    setTimeout(() => {
      this.connect();  // Try again
    }, delay);
  } else {
    alert('Connection lost. Please refresh.');
  }
}
```

**Why exponential backoff?**
- ⚡ First attempt quick (3s) - maybe just a blip
- 🔄 Later attempts slower - avoid overwhelming server
- 🛑 Give up after 5 tries - prevent infinite loops

#### 3. **Session Recovery**

**Problem:**
```
Player disconnects
Player reconnects
Should restore their position in the game
```

**Solution: Player ID Storage**

Client stores ID:
```javascript
// On first join
savePlayerId(id) {
  this.playerId = id;
  localStorage.setItem('playerId', id);  // Persist across sessions
}

// On reconnect
loadStoredPlayerId() {
  this.playerId = localStorage.getItem('playerId');
}

// Send stored ID when rejoining
this.send('JOIN_GAME', {
  playerName,
  playerId: this.playerId  // "Hey, I was player_123"
});
```

Server recognizes returning player:
```javascript
handleMessage(ws, { type: 'JOIN_GAME', payload }) {
  const { playerName, playerId } = payload;
  
  // Check if player is reconnecting
  if (playerId && gameState.players.has(playerId)) {
    // Restore existing player
    gameState.reconnectPlayer(playerId);
    console.log(`${playerName} reconnected`);
  } else {
    // New player
    const newPlayerId = generateId();
    gameState.addPlayer(newPlayerId, playerName, color);
  }
}
```

**What's preserved:**
- ✅ Player ID
- ✅ Player name and color
- ✅ Position in maze (if game still active)

#### 4. **Graceful Degradation**

**Problem:**
```
2 players playing
Player 1 disconnects mid-game
Should Player 2 still be able to finish?
```

**Solution: Mark as Disconnected**

```javascript
removePlayer(playerId) {
  const player = this.players.get(playerId);
  if (player) {
    player.connected = false;  // Don't delete, just mark inactive
  }
  
  // Game continues!
  // If Player 2 reaches exit, they still win
}
```

**Visual feedback:**
```javascript
// In UI, show disconnected players grayed out
<div class="player-item disconnected">
  Player 1 (○ Offline)
</div>
```

### Complete Fault Flow:

```
1. Network drops
   ↓
2. Client stops receiving heartbeat ACKs
   ↓
3. Server timeout (30s without heartbeat)
   ↓
4. Server: player.connected = false
   ↓
5. Server broadcasts PLAYER_DISCONNECTED
   ↓
6. Other clients gray out that player
   ↓
7. Client attempts auto-reconnect (5 tries)
   ↓
8. Connection restored
   ↓
9. Client sends JOIN_GAME with stored playerId
   ↓
10. Server: player.connected = true
   ↓
11. Server sends current game state
   ↓
12. Client resumes from current state
   ↓
13. Other clients see player reconnected
```

### Why this matters:

**Without fault tolerance:**
- ❌ Any disconnect = game over for everyone
- ❌ Players must refresh and start over
- ❌ Poor user experience

**With fault tolerance:**
- ✅ Brief disconnects handled automatically
- ✅ Players can rejoin seamlessly
- ✅ Game continues even if some players drop
- ✅ Professional, reliable experience

**Real-world examples:**
- Video calls (Zoom reconnects automatically)
- Online games (temporary lag doesn't kick you)
- Cloud services (retry failed requests)
- Distributed databases (replica failures handled)

---

## Summary: How They Work Together

These 6 concepts form a complete distributed system:

```
┌─────────────────────────────────────────────────────────┐
│               DISTRIBUTED MAZE GAME                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. CLIENT-SERVER         Centralized authority         │
│     ↓                                                    │
│  2. EVENT BROADCASTING    Everyone sees changes         │
│     ↓                                                    │
│  3. CONCURRENCY CONTROL   No conflicts                  │
│     ↓                                                    │
│  4. CLOCK SYNC            Shared timeline               │
│     ↓                                                    │
│  5. CONSISTENCY           Same state everywhere         │
│     ↓                                                    │
│  6. FAULT TOLERANCE       Works despite failures        │
│                                                          │
│  = RELIABLE MULTIPLAYER GAME                            │
└─────────────────────────────────────────────────────────┘
```

Each concept addresses a specific challenge in distributed systems:

| Concept | Challenge | Solution |
|---------|-----------|----------|
| Client-Server | Who decides truth? | Server is authority |
| Broadcasting | How do others know? | Send updates to all |
| Concurrency | Simultaneous actions? | Sequential processing |
| Clock Sync | Different times? | Server's clock is truth |
| Consistency | Different views? | Single state, broadcast to all |
| Fault Tolerance | Connection lost? | Heartbeat + auto-reconnect |

**Together, they create a robust, real-time multiplayer experience!** 🎮⚡

---

## Further Reading

- **CAP Theorem**: Consistency, Availability, Partition Tolerance
- **Two-Phase Commit**: Distributed transactions
- **Consensus Algorithms**: Paxos, Raft
- **Event Sourcing**: State from event log
- **CRDT**: Conflict-free replicated data types

This game is a practical introduction to these foundational concepts! 🚀
