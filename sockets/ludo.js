const GameRooms = require('../models/GameRooms');
const {
  createInitialState,
  rollDice,
  moveToken
} = require('../utils/games/ludoEngine');

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

function connectedColors(room) {
  const set = new Set();
  room.players.forEach(player => {
    if (player.connected) {
      set.add(player.color);
    }
  });
  return set;
}

module.exports = function initLudoSocket(io) {
  io.on('connection', socket => {
    socket.on('ludo:rooms:list', async () => {
      const rooms = await GameRooms.find({ status: 'waiting' })
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();

      const payload = rooms
        .filter(room => room.players.length < room.maxPlayers)
        .map(room => ({
          roomCode: room.roomCode,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          players: room.players.map(player => ({ username: player.username, color: player.color }))
        }));

      socket.emit('ludo:rooms:list', payload);
    });

    socket.on('ludo:room:connect', async ({ roomCode, playerKey }) => {
      const normalizedCode = (roomCode || '').toString().trim().toUpperCase();
      if (!normalizedCode || !playerKey) {
        return socket.emit('ludo:error', { message: 'Invalid room connection payload.' });
      }

      const room = await GameRooms.findOne({ roomCode: normalizedCode });
      if (!room) {
        return socket.emit('ludo:error', { message: 'Room not found.' });
      }

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) {
        return socket.emit('ludo:error', { message: 'You are not part of this room.' });
      }

      player.connected = true;
      player.socketId = socket.id;
      room.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);
      await room.save();

      socket.data.roomCode = room.roomCode;
      socket.data.playerKey = playerKey;
      socket.join(`ludo:${room.roomCode}`);

      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room, playerKey));
      io.emit('ludo:rooms:update');
    });

    socket.on('ludo:game:start', async ({ roomCode, playerKey }) => {
      const normalizedCode = (roomCode || '').toString().trim().toUpperCase();
      const room = await GameRooms.findOne({ roomCode: normalizedCode });
      if (!room) {
        return socket.emit('ludo:error', { message: 'Room not found.' });
      }

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) {
        return socket.emit('ludo:error', { message: 'You are not part of this room.' });
      }

      if (!player.isHost) {
        return socket.emit('ludo:error', { message: 'Only host can start the game.' });
      }

      if (room.players.length < 2) {
        return socket.emit('ludo:error', { message: 'At least 2 players are required.' });
      }

      if (room.status !== 'waiting') {
        return socket.emit('ludo:error', { message: 'Game already started.' });
      }

      const colors = room.players.map(entry => entry.color);
      room.status = 'playing';
      room.gameState = createInitialState(colors);
      room.markModified('gameState');
      await room.save();

      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
      io.emit('ludo:rooms:update');
    });

    socket.on('ludo:game:roll', async ({ roomCode, playerKey }) => {
      const normalizedCode = (roomCode || '').toString().trim().toUpperCase();
      const room = await GameRooms.findOne({ roomCode: normalizedCode });
      if (!room || room.status !== 'playing' || !room.gameState) {
        return socket.emit('ludo:error', { message: 'Game is not active.' });
      }

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) {
        return socket.emit('ludo:error', { message: 'You are not part of this room.' });
      }

      if (room.gameState.turnColor !== player.color) {
        return socket.emit('ludo:error', { message: 'It is not your turn.' });
      }

      const response = rollDice(room.gameState, connectedColors(room));
      if (!response.ok) {
        return socket.emit('ludo:error', { message: response.error });
      }

      room.markModified('gameState');
      room.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);
      await room.save();

      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
    });

    socket.on('ludo:game:move', async ({ roomCode, playerKey, tokenIdx }) => {
      const normalizedCode = (roomCode || '').toString().trim().toUpperCase();
      const room = await GameRooms.findOne({ roomCode: normalizedCode });
      if (!room || room.status !== 'playing' || !room.gameState) {
        return socket.emit('ludo:error', { message: 'Game is not active.' });
      }

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) {
        return socket.emit('ludo:error', { message: 'You are not part of this room.' });
      }

      if (room.gameState.turnColor !== player.color) {
        return socket.emit('ludo:error', { message: 'It is not your turn.' });
      }

      const parsedTokenIdx = Number(tokenIdx);
      const response = moveToken(room.gameState, parsedTokenIdx, connectedColors(room));
      if (!response.ok) {
        return socket.emit('ludo:error', { message: response.error });
      }

      if (room.gameState.status === 'finished') {
        room.status = 'finished';
      }

      room.markModified('gameState');
      room.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);
      await room.save();

      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
      io.emit('ludo:rooms:update');
    });

    socket.on('ludo:room:leave', async ({ roomCode, playerKey }) => {
      const normalizedCode = (roomCode || '').toString().trim().toUpperCase();
      if (!normalizedCode || !playerKey) return;

      const room = await GameRooms.findOne({ roomCode: normalizedCode });
      if (!room) return;

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) return;

      if (room.status === 'waiting') {
        room.players = room.players.filter(entry => entry.playerKey !== playerKey);
        if (!room.players.length) {
          await GameRooms.deleteOne({ _id: room._id });
          socket.leave(`ludo:${normalizedCode}`);
          io.emit('ludo:rooms:update');
          return;
        }

        if (!room.players.some(entry => entry.isHost)) {
          room.players[0].isHost = true;
        }
      } else {
        player.connected = false;
        player.socketId = null;
      }

      await room.save();

      socket.leave(`ludo:${room.roomCode}`);
      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
      io.emit('ludo:rooms:update');
    });

    socket.on('disconnect', async () => {
      const roomCode = socket.data.roomCode;
      const playerKey = socket.data.playerKey;
      if (!roomCode || !playerKey) return;

      const room = await GameRooms.findOne({ roomCode });
      if (!room) return;

      const player = room.players.find(entry => entry.playerKey === playerKey);
      if (!player) return;

      player.connected = false;
      player.socketId = null;
      await room.save();
      io.to(`ludo:${room.roomCode}`).emit('ludo:room:update', sanitizeRoom(room));
      io.emit('ludo:rooms:update');
    });
  });
};
