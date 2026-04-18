const crypto = require('crypto');
const GameRooms = require('../../models/GameRooms');
const { PLAYER_ORDER } = require('../../utils/games/ludoEngine');

function getDisplayName(req, nickname) {
  if (req.user?.username) {
    return req.user.username;
  }

  const cleaned = (nickname || '').toString().trim().slice(0, 24);
  if (cleaned) {
    return cleaned;
  }

  return `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
}

function sanitizeRoom(room, yourPlayerKey = null) {
  const players = room.players.map(player => ({
    username: player.username,
    color: player.color,
    isHost: player.isHost,
    connected: player.connected,
    isYou: yourPlayerKey ? player.playerKey === yourPlayerKey : false
  }));

  return {
    roomCode: room.roomCode,
    status: room.status,
    maxPlayers: room.maxPlayers,
    players,
    playerCount: players.length,
    gameState: room.gameState
  };
}

async function generateRoomCode() {
  for (let i = 0; i < 8; i++) {
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const exists = await GameRooms.findOne({ roomCode }).select('_id').lean();
    if (!exists) {
      return roomCode;
    }
  }
  throw new Error('Failed to generate room code.');
}

exports.listRooms = async (req, res) => {
  const rooms = await GameRooms.find({ status: 'waiting' })
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();

  const payload = rooms
    .filter(room => room.players.length < room.maxPlayers)
    .map(room => ({
      roomCode: room.roomCode,
      status: room.status,
      maxPlayers: room.maxPlayers,
      playerCount: room.players.length,
      players: room.players.map(player => ({ username: player.username, color: player.color }))
    }));

  res.json({ success: true, rooms: payload });
};

exports.createRoom = async (req, res) => {
  const nickname = req.body?.nickname;
  const maxPlayers = Number(req.body?.maxPlayers || 4);
  const validMaxPlayers = Math.max(2, Math.min(4, maxPlayers));

  const roomCode = await generateRoomCode();
  const playerKey = crypto.randomUUID();
  const username = getDisplayName(req, nickname);

  const room = await GameRooms.create({
    roomCode,
    status: 'waiting',
    maxPlayers: validMaxPlayers,
    players: [
      {
        playerKey,
        user: req.user?._id || null,
        username,
        color: PLAYER_ORDER[0],
        isHost: true,
        isGuest: !req.user,
        connected: false
      }
    ],
    gameState: null
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('ludo:rooms:update');
  }

  res.json({
    success: true,
    room: sanitizeRoom(room, playerKey),
    playerKey,
    color: PLAYER_ORDER[0]
  });
};

exports.joinRoom = async (req, res) => {
  const roomCode = (req.body?.roomCode || '').toString().trim().toUpperCase();
  const nickname = req.body?.nickname;
  const existingPlayerKey = (req.body?.playerKey || '').toString().trim();

  if (!roomCode) {
    return res.status(400).json({ success: false, message: 'Room code is required.' });
  }

  const room = await GameRooms.findOne({ roomCode });
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  if (room.status === 'finished') {
    return res.status(400).json({ success: false, message: 'This room has already finished.' });
  }

  if (existingPlayerKey) {
    const existing = room.players.find(player => player.playerKey === existingPlayerKey);
    if (existing) {
      return res.json({
        success: true,
        room: sanitizeRoom(room, existingPlayerKey),
        playerKey: existingPlayerKey,
        color: existing.color
      });
    }
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ success: false, message: 'Game already started.' });
  }

  if (room.players.length >= room.maxPlayers) {
    return res.status(400).json({ success: false, message: 'Room is full.' });
  }

  const takenColors = new Set(room.players.map(player => player.color));
  const availableColor = PLAYER_ORDER.find(color => !takenColors.has(color));
  if (!availableColor) {
    return res.status(400).json({ success: false, message: 'No seat available.' });
  }

  const playerKey = crypto.randomUUID();
  room.players.push({
    playerKey,
    user: req.user?._id || null,
    username: getDisplayName(req, nickname),
    color: availableColor,
    isHost: false,
    isGuest: !req.user,
    connected: false
  });

  room.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);
  await room.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
    io.emit('ludo:rooms:update');
  }

  res.json({
    success: true,
    room: sanitizeRoom(room, playerKey),
    playerKey,
    color: availableColor
  });
};

exports.getRoomDetails = async (req, res) => {
  const roomCode = (req.params.roomCode || '').toString().trim().toUpperCase();
  const playerKey = (req.query.playerKey || '').toString().trim();

  const room = await GameRooms.findOne({ roomCode });
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  res.json({ success: true, room: sanitizeRoom(room, playerKey) });
};
