const PLAYER_ORDER = ['red', 'green', 'yellow', 'blue'];

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

const START_INDEX = { red: 39, green: 13, yellow: 26, blue: 0 };
const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function createInitialState(activeColors) {
  const tokens = {};
  activeColors.forEach(color => {
    tokens[color] = [{ steps: -1 }, { steps: -1 }, { steps: -1 }, { steps: -1 }];
  });

  return {
    status: 'playing',
    phase: 'rolling',
    activeColors,
    turnIndex: 0,
    turnColor: activeColors[0],
    diceValue: 0,
    selectableTokens: [],
    rankings: [],
    consecutiveSixes: 0,
    winner: null,
    tokens
  };
}

function getMoveableTokens(state, color, diceValue) {
  const moveable = [];
  const playerTokens = state.tokens[color] || [];

  playerTokens.forEach((token, idx) => {
    if (token.steps >= 57) return;
    if (token.steps === -1) {
      if (diceValue === 6) moveable.push(idx);
      return;
    }
    if (token.steps + diceValue <= 57) {
      moveable.push(idx);
    }
  });

  return moveable;
}

function nextTurn(state, connectedColors) {
  if (!state.activeColors.length) return;

  let tries = 0;
  do {
    state.turnIndex = (state.turnIndex + 1) % state.activeColors.length;
    const nextColor = state.activeColors[state.turnIndex];
    const hasFinished = state.rankings.includes(nextColor);
    const isConnected = connectedColors.has(nextColor);
    if (!hasFinished && isConnected) {
      state.turnColor = nextColor;
      state.phase = 'rolling';
      state.diceValue = 0;
      state.selectableTokens = [];
      state.consecutiveSixes = 0;
      return;
    }
    tries++;
  } while (tries <= state.activeColors.length);

  state.phase = 'won';
  state.status = 'finished';
  state.winner = state.rankings[0] || null;
}

function rollDice(state, connectedColors) {
  if (state.phase !== 'rolling') {
    return { ok: false, error: 'You cannot roll right now.' };
  }

  const diceValue = Math.floor(Math.random() * 6) + 1;
  state.diceValue = diceValue;

  if (diceValue === 6) {
    state.consecutiveSixes += 1;
    if (state.consecutiveSixes >= 3) {
      state.consecutiveSixes = 0;
      state.selectableTokens = [];
      nextTurn(state, connectedColors);
      return { ok: true, diceValue, message: 'Three 6s in a row. Turn skipped.' };
    }
  } else {
    state.consecutiveSixes = 0;
  }

  const moveable = getMoveableTokens(state, state.turnColor, diceValue);
  state.selectableTokens = moveable;

  if (!moveable.length) {
    if (diceValue === 6) {
      state.phase = 'rolling';
      return { ok: true, diceValue, message: 'No valid move. Roll again.' };
    }
    nextTurn(state, connectedColors);
    return { ok: true, diceValue, message: 'No valid move.' };
  }

  state.phase = 'selectToken';
  return { ok: true, diceValue, selectableTokens: moveable };
}

function moveToken(state, tokenIdx, connectedColors) {
  if (state.phase !== 'selectToken') {
    return { ok: false, error: 'Select a token after rolling the dice.' };
  }

  if (!state.selectableTokens.includes(tokenIdx)) {
    return { ok: false, error: 'Invalid token selected.' };
  }

  const color = state.turnColor;
  const token = state.tokens[color][tokenIdx];

  if (token.steps === -1) {
    token.steps = 0;
  } else {
    token.steps += state.diceValue;
    if (token.steps > 57) {
      return { ok: false, error: 'Token move exceeds home.' };
    }
  }

  const captureResult = checkCaptureAtCurrentPos(state, color, tokenIdx);
  const finishedToken = token.steps >= 57;

  if (finishedToken) {
    token.steps = 57;
    const allHome = state.tokens[color].every(t => t.steps >= 57);
    if (allHome && !state.rankings.includes(color)) {
      state.rankings.push(color);
    }

    if (state.rankings.length >= state.activeColors.length - 1) {
      const remaining = state.activeColors.find(c => !state.rankings.includes(c));
      if (remaining) state.rankings.push(remaining);
      state.status = 'finished';
      state.phase = 'won';
      state.winner = state.rankings[0] || color;
      return { ok: true, message: `${color} finished and won the game.` };
    }
  }

  const hasExtraTurn = state.diceValue === 6;
  state.selectableTokens = [];

  if (hasExtraTurn) {
    state.phase = 'rolling';
    state.diceValue = 0;
    return { ok: true, captured: captureResult.captured, message: captureResult.message };
  }

  nextTurn(state, connectedColors);
  return { ok: true, captured: captureResult.captured, message: captureResult.message };
}

function checkCaptureAtCurrentPos(state, playerColor, tokenIdx) {
  const token = state.tokens[playerColor][tokenIdx];
  if (token.steps < 0 || token.steps >= 52) {
    return { captured: false, message: '' };
  }

  const pathIdx = (START_INDEX[playerColor] + token.steps) % 52;
  if (SAFE_INDICES.has(pathIdx)) {
    return { captured: false, message: '' };
  }

  const pos = MAIN_PATH[pathIdx];
  let captured = false;

  state.activeColors.forEach(otherColor => {
    if (otherColor === playerColor) return;
    state.tokens[otherColor].forEach(otherToken => {
      if (otherToken.steps < 0 || otherToken.steps >= 52) return;
      const otherPathIdx = (START_INDEX[otherColor] + otherToken.steps) % 52;
      const otherPos = MAIN_PATH[otherPathIdx];
      if (otherPos[0] === pos[0] && otherPos[1] === pos[1]) {
        otherToken.steps = -1;
        captured = true;
      }
    });
  });

  if (!captured) {
    return { captured: false, message: '' };
  }

  return { captured: true, message: `${playerColor} captured a token.` };
}

module.exports = {
  PLAYER_ORDER,
  createInitialState,
  rollDice,
  moveToken
};
