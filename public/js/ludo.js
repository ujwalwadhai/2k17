(function () {
  'use strict';

  const BOARD_CELLS = 15;
  const PLAYER_ORDER = ['red', 'green', 'yellow', 'blue'];
  const PLAYER_LABELS = { red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue' };

  const PLAYER_COLORS = {
    red: { main: '#E74C3C', dark: '#C0392B', light: '#FF6B6B', glow: 'rgba(231,76,60,0.5)' },
    green: { main: '#2ECC71', dark: '#27AE60', light: '#6BFF9E', glow: 'rgba(46,204,113,0.5)' },
    yellow: { main: '#F1C40F', dark: '#D4AC0D', light: '#FFE066', glow: 'rgba(241,196,15,0.5)' },
    blue: { main: '#3498DB', dark: '#2980B9', light: '#6BC5FF', glow: 'rgba(52,152,219,0.5)' }
  };

  const MAIN_PATH = [
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0], [6, 0],
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    [0, 7], [0, 8],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
    [7, 14], [8, 14],
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [14, 7], [14, 6]
  ];

  const HOME_COLUMNS = {
    red: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
    green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    yellow: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]]
  };

  const START_INDEX = { red: 39, green: 13, yellow: 26, blue: 0 };
  const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

  const BASE_POSITIONS = {
    red: [[10, 10], [10, 13], [13, 10], [13, 13]],
    green: [[1, 1], [1, 4], [4, 1], [4, 4]],
    yellow: [[1, 10], [1, 13], [4, 10], [4, 13]],
    blue: [[10, 1], [10, 4], [13, 1], [13, 4]]
  };

  let socket;
  let canvas;
  let ctx;
  let cellSize = 0;

  let numPlayers = 4;
  let roomCode = null;
  let playerKey = null;
  let myColor = null;

  let roomState = null;
  let gameState = null;
  let highlightedTokens = [];
  let messageTimer = null;

  const STORAGE_KEY = 'ludo_room_session_v1';

  function init() {
    canvas = document.getElementById('ludoCanvas');
    ctx = canvas.getContext('2d');

    bindEvents();
    initSocket();
    resizeCanvas();
    restoreSession();
    fetchPublicRooms();
    setInterval(fetchPublicRooms, 15000);
  }

  function bindEvents() {
    document.querySelectorAll('.player-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.player-btn').forEach(node => node.classList.remove('active'));
        btn.classList.add('active');
        numPlayers = parseInt(btn.dataset.players, 10);
      });
    });

    document.getElementById('createRoomBtn').addEventListener('click', createRoom);
    document.getElementById('joinRoomBtn').addEventListener('click', () => {
      const code = document.getElementById('roomCodeInput').value.trim();
      joinRoom(code);
    });

    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('leaveRoomBtn').addEventListener('click', leaveRoom);
    document.getElementById('copyCodeBtn').addEventListener('click', copyRoomCode);

    document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
    document.getElementById('playAgainBtn').addEventListener('click', leaveRoom);
    document.getElementById('backToGamesBtn').addEventListener('click', () => {
      window.location.href = '/games';
    });

    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchend', onCanvasTouch);
    window.addEventListener('resize', resizeCanvas);
  }

  function initSocket() {
    socket = window.io();

    socket.on('connect', () => {
      if (roomCode && playerKey) {
        socket.emit('ludo:room:connect', { roomCode, playerKey });
      }
    });

    socket.on('ludo:room:update', room => {
      roomState = room;
      gameState = room.gameState || null;

      if (!myColor && room.players) {
        const me = room.players.find(player => player.isYou);
        if (me) {
          myColor = me.color;
        }
      }

      updateRoomUI();
      updateGameUI();
      drawBoard();
      fetchPublicRooms();
    });

    socket.on('ludo:rooms:list', renderPublicRooms);

    socket.on('ludo:rooms:update', () => {
      fetchPublicRooms();
    });

    socket.on('ludo:error', payload => {
      const message = payload?.message || 'Something went wrong.';
      showMessage(message, 2400);
      if (typeof Toast === 'function') {
        Toast(message, 'error');
      }
    });
  }

  async function apiGet(url) {
    const response = await fetch(url, { credentials: 'same-origin' });
    return response.json();
  }

  async function apiPost(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body || {})
    });
    return response.json();
  }

  function getNickname() {
    if (window.currentUser && window.currentUser.username) {
      return window.currentUser.username;
    }
    return document.getElementById('nicknameInput').value.trim();
  }

  async function createRoom() {
    const nickname = getNickname();
    const payload = await apiPost('/api/games/ludo/rooms/create', {
      nickname,
      maxPlayers: numPlayers
    });

    if (!payload.success) {
      showMessage(payload.message || 'Failed to create room.', 2200);
      return;
    }

    roomCode = payload.room.roomCode;
    playerKey = payload.playerKey;
    myColor = payload.color;

    saveSession();
    connectRoom();

    if (typeof Toast === 'function') {
      Toast('Room created. Share the code with friends.', 'success');
    }
  }

  async function joinRoom(code) {
    const roomCodeInput = (code || '').trim().toUpperCase();
    if (!roomCodeInput) {
      showMessage('Enter room code.', 1600);
      return;
    }

    const payload = await apiPost('/api/games/ludo/rooms/join', {
      roomCode: roomCodeInput,
      nickname: getNickname(),
      playerKey: getStoredSession()?.playerKey || ''
    });

    if (!payload.success) {
      showMessage(payload.message || 'Failed to join room.', 2200);
      return;
    }

    roomCode = payload.room.roomCode;
    playerKey = payload.playerKey;
    myColor = payload.color;

    saveSession();
    connectRoom();

    if (typeof Toast === 'function') {
      Toast('Joined room successfully.', 'success');
    }
  }

  function connectRoom() {
    document.getElementById('ludoSetup').style.display = 'none';
    document.getElementById('ludoGame').classList.add('active');
    requestAnimationFrame(() => {
      resizeCanvas();
      drawBoard();
    });
    socket.emit('ludo:room:connect', { roomCode, playerKey });
  }

  function leaveRoom() {
    if (roomCode && playerKey) {
      socket.emit('ludo:room:leave', { roomCode, playerKey });
    }

    roomCode = null;
    playerKey = null;
    myColor = null;
    roomState = null;
    gameState = null;
    highlightedTokens = [];

    clearSession();

    document.getElementById('ludoSetup').style.display = 'flex';
    document.getElementById('ludoGame').classList.remove('active');
    document.querySelector('.winner-overlay').classList.remove('active');
    fetchPublicRooms();
  }

  function startGame() {
    if (!roomCode || !playerKey) return;
    socket.emit('ludo:game:start', { roomCode, playerKey });
  }

  function rollDice() {
    if (!canRoll()) return;
    animateDice();
    socket.emit('ludo:game:roll', { roomCode, playerKey });
  }

  function canRoll() {
    return Boolean(
      gameState &&
      gameState.phase === 'rolling' &&
      gameState.turnColor === myColor &&
      roomState && roomState.status === 'playing'
    );
  }

  function canSelectToken() {
    return Boolean(
      gameState &&
      gameState.phase === 'selectToken' &&
      gameState.turnColor === myColor
    );
  }

  function animateDice() {
    const diceEl = document.querySelector('.dice');
    diceEl.classList.add('rolling');
    setTimeout(() => diceEl.classList.remove('rolling'), 620);
  }

  function updateRoomUI() {
    const roomCodeLabel = document.getElementById('roomCodeLabel');
    const playersPanel = document.getElementById('playersPanel');
    const startBtn = document.getElementById('startGameBtn');

    roomCodeLabel.textContent = roomCode || '-';

    if (!roomState) {
      playersPanel.innerHTML = '';
      startBtn.style.display = 'none';
      return;
    }

    const host = roomState.players.find(player => player.isHost);
    const me = roomState.players.find(player => player.color === myColor);

    startBtn.style.display = roomState.status === 'waiting' ? 'inline-flex' : 'none';
    startBtn.disabled = !(me && me.isHost && roomState.playerCount >= 2);

    playersPanel.innerHTML = roomState.players
      .map(player => {
        const onlineBadge = player.connected ? '<span class="online">online</span>' : '<span class="offline">offline</span>';
        const badges = [
          player.isHost ? '<span class="host">host</span>' : '',
          player.color === myColor ? '<span class="you">you</span>' : '',
          onlineBadge
        ].filter(Boolean).join(' ');

        return `<div class="player-pill ${player.color}">
          <strong>${escapeHtml(player.username)}</strong>
          <span>${PLAYER_LABELS[player.color]}</span>
          <div class="pill-badges">${badges}</div>
        </div>`;
      })
      .join('');

    if (host && roomState.status === 'waiting') {
      document.querySelector('.game-status').textContent = `${host.username} is hosting. Waiting for players.`;
    }
  }

  function updateGameUI() {
    const turnLabel = document.querySelector('.turn-label');
    const turnDot = document.querySelector('.turn-dot');
    const rollBtn = document.getElementById('rollDiceBtn');

    if (!gameState) {
      turnLabel.textContent = 'Lobby';
      turnDot.style.background = '#888';
      rollBtn.disabled = true;
      updateDiceDisplay(1);
      buildScoreboard([]);
      return;
    }

    const activePlayers = gameState.activeColors || [];
    buildScoreboard(activePlayers);

    const turnColor = gameState.turnColor;
    const colors = PLAYER_COLORS[turnColor] || PLAYER_COLORS.red;

    turnDot.style.background = colors.main;
    turnDot.style.color = colors.main;

    if (gameState.phase === 'won') {
      turnLabel.textContent = 'Game Over';
    } else {
      turnLabel.textContent = `${PLAYER_LABELS[turnColor]}'s Turn`;
    }

    if (gameState.phase === 'rolling') {
      document.querySelector('.game-status').textContent =
        myColor === turnColor ? 'Your turn. Roll the dice.' : `${PLAYER_LABELS[turnColor]} is rolling.`;
    } else if (gameState.phase === 'selectToken') {
      document.querySelector('.game-status').textContent =
        myColor === turnColor ? 'Choose a token to move.' : `${PLAYER_LABELS[turnColor]} is selecting a token.`;
    }

    rollBtn.disabled = !canRoll();
    updateDiceDisplay(gameState.diceValue || 1);

    if (gameState.phase === 'selectToken' && myColor === turnColor) {
      highlightedTokens = Array.isArray(gameState.selectableTokens) ? gameState.selectableTokens : [];
    } else {
      highlightedTokens = [];
    }

    if (gameState.phase === 'won') {
      showWinner();
    }
  }

  function buildScoreboard(activePlayers) {
    const sb = document.querySelector('.scoreboard');
    sb.innerHTML = '';

    activePlayers.forEach(color => {
      const colors = PLAYER_COLORS[color];
      const div = document.createElement('div');
      div.className = 'player-score';
      div.dataset.player = color;
      div.style.color = colors.main;

      const tokenData = gameState?.tokens?.[color] || [];

      div.innerHTML = `
        <div class="player-name" style="color:${colors.main}">${PLAYER_LABELS[color]}</div>
        <div class="token-indicators">
          ${tokenData.map((token, idx) => {
            const classes = ['token-indicator'];
            if (token.steps >= 57) classes.push('home');
            if (token.steps >= 0 && token.steps < 57) classes.push('active');
            return `<div class="${classes.join(' ')}" data-player="${color}" data-token="${idx}" style="background:${colors.main}"></div>`;
          }).join('')}
        </div>`;
      sb.appendChild(div);
    });

    if (gameState?.turnColor) {
      document.querySelectorAll('.player-score').forEach(node => {
        node.classList.toggle('current', node.dataset.player === gameState.turnColor);
      });
    }
  }

  function updateDiceDisplay(value) {
    const face = document.querySelector('.dice-face');
    if (!face) return;

    const val = Math.max(1, Math.min(6, Number(value || 1)));
    face.className = `dice-face face-${val}`;
    face.innerHTML = '';

    for (let i = 0; i < val; i++) {
      const dot = document.createElement('div');
      dot.className = 'dice-dot';
      face.appendChild(dot);
    }
  }

  function onCanvasTouch(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = event.changedTouches[0];
    handleBoardClick(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  function onCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    handleBoardClick(event.clientX - rect.left, event.clientY - rect.top);
  }

  function handleBoardClick(x, y) {
    if (canRoll()) {
      rollDice();
      return;
    }

    if (!canSelectToken()) return;

    const clickedCol = x / cellSize;
    const clickedRow = y / cellSize;

    let closestToken = -1;
    let closestDistance = Infinity;

    highlightedTokens.forEach(tokenIdx => {
      const pos = getTokenPixelCenter(myColor, tokenIdx);
      const dx = pos.x / cellSize - clickedCol;
      const dy = pos.y / cellSize - clickedRow;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1.2 && distance < closestDistance) {
        closestDistance = distance;
        closestToken = tokenIdx;
      }
    });

    if (closestToken >= 0) {
      socket.emit('ludo:game:move', { roomCode, playerKey, tokenIdx: closestToken });
    }
  }

  function showWinner() {
    if (!gameState || gameState.phase !== 'won') return;
    const winner = gameState.winner || gameState.rankings?.[0] || 'red';

    const overlay = document.querySelector('.winner-overlay');
    overlay.classList.add('active');

    const winnerLabel = document.querySelector('.winner-name');
    winnerLabel.textContent = `${PLAYER_LABELS[winner]} Player`;
    winnerLabel.style.color = PLAYER_COLORS[winner].main;
  }

  function showMessage(message, duration) {
    const el = document.getElementById('gameMessage');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => el.classList.remove('show'), duration || 2000);
  }

  function copyRoomCode() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => {
      showMessage('Room code copied.', 1400);
    }).catch(() => {
      showMessage('Could not copy room code.', 1400);
    });
  }

  function restoreSession() {
    const stored = getStoredSession();
    if (!stored) return;

    roomCode = stored.roomCode;
    playerKey = stored.playerKey;
    myColor = stored.color;

    if (roomCode && playerKey) {
      connectRoom();
    }
  }

  function getStoredSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function saveSession() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      roomCode,
      playerKey,
      color: myColor
    }));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  async function fetchPublicRooms() {
    if (!socket) return;
    socket.emit('ludo:rooms:list');

    const payload = await apiGet('/api/games/ludo/rooms');
    if (payload.success) {
      renderPublicRooms(payload.rooms);
    }
  }

  function renderPublicRooms(rooms) {
    const container = document.getElementById('publicRooms');
    if (!Array.isArray(rooms) || !rooms.length) {
      container.innerHTML = '<div class="room-empty">No open room right now.</div>';
      return;
    }

    container.innerHTML = rooms.map(room => {
      const names = room.players.map(player => escapeHtml(player.username)).join(', ');
      return `<button class="room-card" data-room="${room.roomCode}">
        <div><strong>${room.roomCode}</strong></div>
        <div>${room.playerCount}/${room.maxPlayers} players</div>
        <small>${names || 'Waiting for players'}</small>
      </button>`;
    }).join('');

    container.querySelectorAll('.room-card').forEach(btn => {
      btn.addEventListener('click', () => joinRoom(btn.dataset.room));
    });
  }

  function resizeCanvas() {
    const container = canvas.parentElement;
    const width = container.clientWidth || 560;
    const height = container.clientHeight || width;
    const size = Math.min(width, height, 560);

    canvas.width = size * (window.devicePixelRatio || 1);
    canvas.height = size * (window.devicePixelRatio || 1);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    cellSize = size / BOARD_CELLS;
    drawBoard();
  }

  function drawBoard() {
    if (!ctx || !canvas) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    drawBoardBackground(w, h);
    drawBases();
    drawPathCells();
    drawHomeColumns();
    drawCenterHome();
    drawSafeStars();
    drawStartArrows();
    drawAllTokens();
  }

  function activeColors() {
    if (gameState?.activeColors?.length) return gameState.activeColors;
    if (roomState?.players?.length) return roomState.players.map(player => player.color);
    return [];
  }

  function drawBoardBackground(w, h) {
    ctx.fillStyle = '#faf3e0';
    roundRect(ctx, 0, 0, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= BOARD_CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(w, i * cellSize);
      ctx.stroke();
    }
  }

  function drawBases() {
    const bases = {
      red: { row: 9, col: 9 },
      green: { row: 0, col: 0 },
      yellow: { row: 0, col: 9 },
      blue: { row: 9, col: 0 }
    };

    activeColors().forEach(player => {
      const base = bases[player];
      const colors = PLAYER_COLORS[player];

      const x = base.col * cellSize;
      const y = base.row * cellSize;
      const size = 6 * cellSize;

      ctx.fillStyle = colors.main;
      roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 10);
      ctx.fill();

      const inset = cellSize * 0.8;
      ctx.fillStyle = '#fff';
      roundRect(ctx, x + inset, y + inset, size - inset * 2, size - inset * 2, 8);
      ctx.fill();

      BASE_POSITIONS[player].forEach(pos => {
        const cx = (pos[1] + 0.5) * cellSize;
        const cy = (pos[0] + 0.5) * cellSize;
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.light}66`;
        ctx.fill();
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });
  }

  function drawPathCells() {
    const colors = activeColors();

    MAIN_PATH.forEach((pos, idx) => {
      let isStart = false;
      let startColor = null;

      colors.forEach(color => {
        if (START_INDEX[color] === idx) {
          isStart = true;
          startColor = color;
        }
      });

      const x = pos[1] * cellSize;
      const y = pos[0] * cellSize;
      ctx.fillStyle = isStart ? `${PLAYER_COLORS[startColor].light}88` : '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.8;
      ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
    });
  }

  function drawHomeColumns() {
    activeColors().forEach(player => {
      const colors = PLAYER_COLORS[player];
      HOME_COLUMNS[player].forEach(pos => {
        const x = pos[1] * cellSize;
        const y = pos[0] * cellSize;
        ctx.fillStyle = `${colors.light}55`;
        ctx.strokeStyle = `${colors.main}44`;
        ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      });
    });
  }

  function drawCenterHome() {
    activeColors().forEach(player => {
      ctx.fillStyle = PLAYER_COLORS[player].main;
      ctx.beginPath();

      if (player === 'red') {
        ctx.moveTo(9 * cellSize, 6 * cellSize);
        ctx.lineTo(9 * cellSize, 9 * cellSize);
        ctx.lineTo(7.5 * cellSize, 7.5 * cellSize);
      } else if (player === 'green') {
        ctx.moveTo(6 * cellSize, 6 * cellSize);
        ctx.lineTo(6 * cellSize, 9 * cellSize);
        ctx.lineTo(7.5 * cellSize, 7.5 * cellSize);
      } else if (player === 'yellow') {
        ctx.moveTo(6 * cellSize, 6 * cellSize);
        ctx.lineTo(9 * cellSize, 6 * cellSize);
        ctx.lineTo(7.5 * cellSize, 7.5 * cellSize);
      } else if (player === 'blue') {
        ctx.moveTo(6 * cellSize, 9 * cellSize);
        ctx.lineTo(9 * cellSize, 9 * cellSize);
        ctx.lineTo(7.5 * cellSize, 7.5 * cellSize);
      }

      ctx.closePath();
      ctx.fill();
    });

    const cx = 7.5 * cellSize;
    const cy = 7.5 * cellSize;

    ctx.beginPath();
    ctx.arc(cx, cy, cellSize * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = `bold ${cellSize * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HOME', cx, cy);
  }

  function drawSafeStars() {
    const colors = activeColors();

    SAFE_INDICES.forEach(idx => {
      const isStart = colors.some(color => START_INDEX[color] === idx);
      if (isStart) return;

      const pos = MAIN_PATH[idx];
      const cx = (pos[1] + 0.5) * cellSize;
      const cy = (pos[0] + 0.5) * cellSize;
      drawStar(cx, cy, cellSize * 0.15, cellSize * 0.3, 5, '#d4ac0d');
    });
  }

  function drawStartArrows() {
    activeColors().forEach(player => {
      const idx = START_INDEX[player];
      const pos = MAIN_PATH[idx];
      const cx = (pos[1] + 0.5) * cellSize;
      const cy = (pos[0] + 0.5) * cellSize;

      ctx.fillStyle = PLAYER_COLORS[player].dark;
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('*', cx, cy);
    });
  }

  function drawAllTokens() {
    if (!gameState?.tokens) return;

    const posMap = {};

    activeColors().forEach(player => {
      (gameState.tokens[player] || []).forEach((token, tokenIdx) => {
        if (token.steps >= 57) return;
        const pos = getTokenGridPos(player, tokenIdx);
        const key = `${pos[0]},${pos[1]}`;
        if (!posMap[key]) posMap[key] = [];
        posMap[key].push({ player, tokenIdx });
      });
    });

    Object.keys(posMap).forEach(key => {
      const tokenList = posMap[key];
      const [row, col] = key.split(',').map(Number);
      const baseCx = (col + 0.5) * cellSize;
      const baseCy = (row + 0.5) * cellSize;

      tokenList.forEach((entry, stackIdx) => {
        const colors = PLAYER_COLORS[entry.player];
        const radius = cellSize * 0.33;
        const offset = tokenList.length > 1 ? (stackIdx - (tokenList.length - 1) / 2) * cellSize * 0.2 : 0;
        const cx = baseCx + offset;
        const cy = baseCy - stackIdx * 2;
        const highlighted = entry.player === myColor && highlightedTokens.includes(entry.tokenIdx);

        if (highlighted) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = colors.glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx + 1, cy + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();

        const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
        grad.addColorStop(0, colors.light);
        grad.addColorStop(0.6, colors.main);
        grad.addColorStop(1, colors.dark);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${cellSize * 0.24}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entry.tokenIdx + 1, cx, cy + 0.5);
      });
    });
  }

  function getTokenGridPos(player, tokenIdx) {
    const token = gameState?.tokens?.[player]?.[tokenIdx];
    if (!token) return BASE_POSITIONS[player][tokenIdx];

    if (token.steps === -1) {
      return BASE_POSITIONS[player][tokenIdx];
    }

    if (token.steps >= 52) {
      const homeIdx = token.steps - 52;
      if (homeIdx >= 6) return [7, 7];
      return HOME_COLUMNS[player][homeIdx];
    }

    const pathIdx = (START_INDEX[player] + token.steps) % 52;
    return MAIN_PATH[pathIdx];
  }

  function getTokenPixelCenter(player, tokenIdx) {
    const pos = getTokenGridPos(player, tokenIdx);
    return {
      x: (pos[1] + 0.5) * cellSize,
      y: (pos[0] + 0.5) * cellSize
    };
  }

  function drawStar(cx, cy, innerR, outerR, points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
  }

  function roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
