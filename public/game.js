// ============= GAME CLIENT =============
class MazeGame {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.gameState = null;
    this.canvas = document.getElementById('mazeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = 30;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    
    this.setupCanvas();
    this.setupKeyboardControls();
    this.loadStoredPlayerId();
  }

  loadStoredPlayerId() {
    // Try to recover player ID from localStorage for reconnection
    this.playerId = localStorage.getItem('playerId');
  }

  savePlayerId(id) {
    this.playerId = id;
    localStorage.setItem('playerId', id);
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.origin.replace(/^http/, 'ws');
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to server');
      this.updateConnectionStatus(true);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.updateConnectionStatus(false);
      this.stopHeartbeat();
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 3000 * this.reconnectAttempts); // Exponential backoff
    } else {
      alert('Lost connection to server. Please refresh the page.');
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('HEARTBEAT', {});
      }
    }, 10000); // Send heartbeat every 10 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    const textEl = document.getElementById('connectionText');
    
    if (connected) {
      statusEl.className = 'connection-status connected';
      textEl.textContent = 'CONNECTED';
    } else {
      statusEl.className = 'connection-status disconnected';
      textEl.textContent = 'DISCONNECTED';
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  handleMessage(message) {
    const { type } = message;

    switch (type) {
      case 'JOINED':
        this.savePlayerId(message.playerId);
        this.updateGameState(message.state);
        this.closeJoinModal();
        break;

      case 'PLAYER_JOINED':
      case 'PLAYER_DISCONNECTED':
      case 'PLAYER_MOVED':
      case 'GAME_STARTED':
      case 'GAME_RESET':
        this.updateGameState(message.state);
        break;

      case 'GAME_OVER':
        this.updateGameState(message.state);
        this.showWinner(message.state.winner);
        break;

      case 'TIMER_UPDATE':
        this.updateTimer(message.timer);
        break;

      case 'INVALID_MOVE':
        // Visual feedback for invalid move
        this.flashCanvas('#ff006e');
        break;

      case 'ERROR':
        alert(message.message);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  updateGameState(state) {
    this.gameState = state;
    this.render();
    this.updateUI();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    // Set canvas size based on container
    const size = Math.min(maxWidth, maxHeight, 600);
    this.canvas.width = size;
    this.canvas.height = size;
    
    // Calculate cell size
    this.cellSize = Math.floor(size / 15); // 15x15 mazes
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameState || !this.gameState.gameActive) return;

      const keyMap = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'w': 'UP',
        's': 'DOWN',
        'a': 'LEFT',
        'd': 'RIGHT',
        'W': 'UP',
        'S': 'DOWN',
        'A': 'LEFT',
        'D': 'RIGHT'
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        this.move(direction);
      }
    });
  }

  render() {
    if (!this.gameState || !this.gameState.maze) {
      this.renderWaitingScreen();
      return;
    }

    const { maze, players } = this.gameState;
    const { grid, exit } = maze;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw maze
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;

        if (grid[y][x] === 1) {
          // Wall
          this.ctx.fillStyle = '#1a1a2e';
          this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
          
          // Wall border glow
          this.ctx.strokeStyle = 'rgba(131, 56, 236, 0.3)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
        } else {
          // Path
          this.ctx.fillStyle = '#0f1419';
          this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
          
          // Subtle grid
          this.ctx.strokeStyle = 'rgba(6, 255, 165, 0.05)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
        }
      }
    }

    // Draw exit with glow effect
    const exitX = exit.x * this.cellSize;
    const exitY = exit.y * this.cellSize;
    
    // Glow
    const gradient = this.ctx.createRadialGradient(
      exitX + this.cellSize / 2, exitY + this.cellSize / 2, 0,
      exitX + this.cellSize / 2, exitY + this.cellSize / 2, this.cellSize
    );
    gradient.addColorStop(0, 'rgba(255, 190, 11, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 190, 11, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 190, 11, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(exitX - this.cellSize / 2, exitY - this.cellSize / 2, 
                      this.cellSize * 2, this.cellSize * 2);
    
    // Exit marker
    this.ctx.fillStyle = '#ffbe0b';
    this.ctx.fillRect(exitX, exitY, this.cellSize, this.cellSize);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(exitX, exitY, this.cellSize, this.cellSize);
    
    // Exit symbol
    this.ctx.font = `bold ${this.cellSize * 0.6}px Arial`;
    this.ctx.fillStyle = '#000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('★', exitX + this.cellSize / 2, exitY + this.cellSize / 2);

    // Draw players
    players.forEach(player => {
      if (!player.position || !player.connected) return;

      const px = player.position.x * this.cellSize;
      const py = player.position.y * this.cellSize;
      
      // Player glow
      const playerGradient = this.ctx.createRadialGradient(
        px + this.cellSize / 2, py + this.cellSize / 2, 0,
        px + this.cellSize / 2, py + this.cellSize / 2, this.cellSize * 0.8
      );
      playerGradient.addColorStop(0, `${player.color}80`);
      playerGradient.addColorStop(0.5, `${player.color}40`);
      playerGradient.addColorStop(1, `${player.color}00`);
      this.ctx.fillStyle = playerGradient;
      this.ctx.fillRect(px - this.cellSize / 4, py - this.cellSize / 4, 
                        this.cellSize * 1.5, this.cellSize * 1.5);
      
      // Player circle
      this.ctx.beginPath();
      this.ctx.arc(
        px + this.cellSize / 2, 
        py + this.cellSize / 2, 
        this.cellSize * 0.35,
        0, 
        Math.PI * 2
      );
      this.ctx.fillStyle = player.color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Player initial
      this.ctx.font = `bold ${this.cellSize * 0.4}px Orbitron`;
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        player.name[0].toUpperCase(), 
        px + this.cellSize / 2, 
        py + this.cellSize / 2
      );

      // Player name above
      this.ctx.font = `${this.cellSize * 0.25}px Orbitron`;
      this.ctx.fillStyle = player.color;
      this.ctx.shadowColor = player.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillText(
        player.name, 
        px + this.cellSize / 2, 
        py - this.cellSize * 0.3
      );
      this.ctx.shadowBlur = 0;
    });
  }

  renderWaitingScreen() {
    this.ctx.fillStyle = '#0f1419';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.font = 'bold 24px Orbitron';
    this.ctx.fillStyle = '#06ffa5';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'Waiting for game to start...', 
      this.canvas.width / 2, 
      this.canvas.height / 2
    );
    
    this.ctx.font = '16px Orbitron';
    this.ctx.fillStyle = '#8338ec';
    this.ctx.fillText(
      'Need at least 2 players', 
      this.canvas.width / 2, 
      this.canvas.height / 2 + 40
    );
  }

  updateUI() {
    if (!this.gameState) return;

    const { players, gameActive, timer } = this.gameState;

    // Update player count
    const connectedPlayers = players.filter(p => p.connected);
    document.getElementById('playerCount').textContent = connectedPlayers.length;

    // Update game status
    const statusEl = document.getElementById('gameStatus');
    if (this.gameState.winner) {
      statusEl.textContent = 'FINISHED';
      statusEl.style.color = '#ffbe0b';
    } else if (gameActive) {
      statusEl.textContent = 'PLAYING';
      statusEl.style.color = '#06ffa5';
    } else {
      statusEl.textContent = 'WAITING';
      statusEl.style.color = '#8338ec';
    }

    // Update timer
    this.updateTimer(timer);

    // Update players list
    this.updatePlayersList(players);

    // Update start button
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = connectedPlayers.length < 2 || gameActive;
  }

  updatePlayersList(players) {
    const listEl = document.getElementById('playersList');
    
    if (players.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--neon-cyan); opacity: 0.6;">
          Waiting for players<span class="loading">...</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = players.map(player => `
      <div class="player-item ${player.id === this.playerId ? 'you' : ''} ${!player.connected ? 'disconnected' : ''}">
        <div class="player-avatar" style="border-color: ${player.color}; background: ${player.color}40; color: ${player.color}; box-shadow: 0 0 10px ${player.color};">
          ${player.name[0].toUpperCase()}
        </div>
        <div class="player-name" style="color: ${player.color};">
          ${player.name}
          ${player.id === this.playerId ? ' (You)' : ''}
        </div>
        <div class="player-status" style="background: ${player.connected ? 'rgba(6, 255, 165, 0.2)' : 'rgba(255, 0, 110, 0.2)'}; color: ${player.connected ? '#06ffa5' : '#ff006e'};">
          ${player.connected ? '●' : '○'}
        </div>
      </div>
    `).join('');
  }

  updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('gameTimer').textContent = 
      `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  showWinner(winner) {
    const banner = document.getElementById('winnerBanner');
    const nameEl = document.getElementById('winnerName');
    
    nameEl.textContent = winner.name;
    nameEl.style.color = winner.color;
    banner.style.display = 'block';
  }

  hideWinner() {
    document.getElementById('winnerBanner').style.display = 'none';
  }

  flashCanvas(color) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${color};
      opacity: 0.3;
      pointer-events: none;
      animation: flashFade 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flashFade {
        from { opacity: 0.3; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    this.canvas.parentElement.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 300);
  }

  closeJoinModal() {
    document.getElementById('joinModal').classList.remove('active');
  }

  move(direction) {
    if (!this.gameState || !this.gameState.gameActive || this.gameState.winner) {
      return;
    }
    this.send('MOVE', { direction });
  }

  joinGame(playerName) {
    this.send('JOIN_GAME', { 
      playerName, 
      playerId: this.playerId 
    });
  }

  startGame() {
    this.send('START_GAME', {});
  }

  resetGame() {
    this.hideWinner();
    this.send('RESET_GAME', {});
  }
}

// ============= GLOBAL GAME INSTANCE =============
let game;

window.onload = () => {
  game = new MazeGame();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    game.setupCanvas();
    game.render();
  });

  // Enter key to join
  document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      joinGame();
    }
  });
  
  // Auto-focus on name input
  document.getElementById('playerNameInput').focus();
};

// ============= GLOBAL FUNCTIONS =============
function joinGame() {
  const nameInput = document.getElementById('playerNameInput');
  const playerName = nameInput.value.trim();
  
  if (!playerName) {
    alert('Please enter your name');
    return;
  }
  
  game.connect();
  
  // Wait for connection then join
  const interval = setInterval(() => {
    if (game.ws && game.ws.readyState === WebSocket.OPEN) {
      console.log("Sending JOIN_GAME");
      game.joinGame(playerName);
      clearInterval(interval);
    }
  }, 100);
  // setTimeout(() => {
  //   game.joinGame(playerName);
  // }, 500);
}

function startGame() {
  game.startGame();
}

function resetGame() {
  game.resetGame();
}

function move(direction) {
  game.move(direction);
}

// Prevent page zoom on mobile
document.addEventListener('touchmove', (e) => {
  if (e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });
