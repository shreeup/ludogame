import { nanoid } from 'nanoid';

const SAFE_ZONES = new Set([0, 8, 13, 21, 26, 34, 39, 47, 52]); // Example safe positions
const WINNING_POSITION = 57; // Assuming 57 is the final position in Ludo

type Game = {
  id: string;
  players: string[];
  spectators: string[];
  createdAt: number;
  sockets: Map<string, WebSocket>;
  currentTurn: number;
  positions: Map<string, number>;
  timeoutId: NodeJS.Timeout | null;
};

const games = new Map<string, Game>();

export const createGame = (): string => {
  const gameId = nanoid(6); // Generate a 6-character random code
  games.set(gameId, {
    id: gameId,
    players: [],
    spectators: [],
    createdAt: Date.now(),
    sockets: new Map<string, WebSocket>(),
    currentTurn: 0,
    positions: new Map<string, number>(),
    timeoutId: null,
  });
  return gameId;
};

export const joinGame = (
  gameId: string,
  playerId: string,
  ws: WebSocket
): string | null => {
  const game = games.get(gameId);
  if (!game) return null;

  if (!game.sockets.has(playerId)) {
    if (game.players.length < 4) {
      game.players.push(playerId);
      game.sockets.set(playerId, ws);
      return 'player';
    } else {
      game.spectators.push(playerId);
      game.sockets.set(playerId, ws);
      return 'spectator';
    }
  }
  return null; // Player already in game
};

export const broadcastGameState = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  const state = { players: game.players, spectators: game.spectators };
  const message = JSON.stringify({ type: 'GAME_STATE', state });

  game.sockets.forEach(ws => {
    if (ws.readyState === ws.OPEN) ws.send(message);
  });
};

export const getGame = (gameId: string) => games.get(gameId);
export const removeGame = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  // Clear timeout if it exists
  if (game.timeoutId) {
    clearTimeout(game.timeoutId);
    game.timeoutId = null;
  }

  games.delete(gameId);
};

export const getAllGames = () => games;

export const startGame = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  game.currentTurn = 0;
  game.positions = new Map(game.players.map(p => [p, 0])); // Initialize all players at start position
  game.timeoutId = null;

  broadcastGameState(gameId);
  startTurnTimeout(gameId);
};

export const getCurrentPlayer = (gameId: string): string | null => {
  const game = games.get(gameId);
  if (!game) return null;
  return game.players[game.currentTurn];
};

export const nextTurn = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  clearTurnTimeout(gameId);

  game.currentTurn = (game.currentTurn + 1) % game.players.length;
  broadcastGameState(gameId);

  startTurnTimeout(gameId);
};

export const moveToken = (gameId: string, playerId: string, steps: number) => {
  const game = games.get(gameId);
  if (!game) return;

  const currentPos = game.positions.get(playerId) || 0;
  const newPos = Math.min(currentPos + steps, WINNING_POSITION); // Prevent going beyond final position

  game.positions.set(playerId, newPos);

  // Check if the player wins
  if (newPos === WINNING_POSITION) {
    game.sockets
      .get(playerId)
      ?.send(JSON.stringify({ type: 'WINNER', message: `${playerId} wins!` }));
    game.players = game.players.filter(p => p !== playerId);
    if (game.players.length === 1) {
      // Game ends when only one player is left
      broadcastGameState(gameId);
      removeGame(gameId);
    }
    return;
  }

  // Check if player lands on an opponent's token (except in safe zones)
  for (const [otherPlayer, pos] of game.positions.entries()) {
    if (otherPlayer !== playerId && pos === newPos && !SAFE_ZONES.has(newPos)) {
      game.positions.set(otherPlayer, 0); // Reset opponent to start
      game.sockets
        .get(otherPlayer)
        ?.send(
          JSON.stringify({ type: 'KNOCKOUT', message: 'You got knocked out!' })
        );
    }
  }

  broadcastGameState(gameId);
};

export const startTurnTimeout = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  // Set timeout to automatically pass turn after 1 minute (60,000 ms)
  game.timeoutId = setTimeout(() => {
    nextTurn(gameId);
  }, 60000); // 1 minute timeout
};

// Clear the timeout when the player takes an action
export const clearTurnTimeout = (gameId: string) => {
  const game = games.get(gameId);
  if (game && game.timeoutId) {
    clearTimeout(game.timeoutId);
    game.timeoutId = null;
  }
};
