const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    playerKey: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    username: { type: String, required: true, trim: true },
    color: { type: String, enum: ['red', 'green', 'yellow', 'blue'], required: true },
    isHost: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: true },
    connected: { type: Boolean, default: false },
    socketId: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const gameRoomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'finished'],
      default: 'waiting'
    },
    maxPlayers: {
      type: Number,
      min: 2,
      max: 4,
      default: 4
    },
    players: {
      type: [playerSchema],
      validate: [val => val.length <= 4, 'Room cannot have more than 4 players']
    },
    gameState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 8)
    }
  },
  { timestamps: true }
);

gameRoomSchema.index({ roomCode: 1 }, { unique: true });
gameRoomSchema.index({ status: 1, updatedAt: -1 });
gameRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GameRooms = mongoose.model('GameRooms', gameRoomSchema);

module.exports = GameRooms;
