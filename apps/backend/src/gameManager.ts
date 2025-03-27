import { nanoid } from 'nanoid';
import WebSocket from 'ws';

const SAFE_ZONES = new Set([0, 8, 13, 21, 26, 34, 39, 47, 52]); // Example safe positions
const WINNING_POSITION = 57; // Assuming 57 is the final position in Ludo

type PlayerColor = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';

type Token = {
  id: string;
  position: number;
};

type Game = {
  id: string;
  players: string[];
  spectators: string[];
  createdAt: number;
  sockets: Map<string, WebSocket>;
  currentTurn: number;
  tokens: Map<string, Token[]>;
  timeoutId: NodeJS.Timeout | null;
  lastDiceRoll: number;
  playerColors: Map<string, PlayerColor>;
  diceUsed: boolean;
};

const COLORS: PlayerColor[] = ['RED', 'GREEN', 'BLUE', 'YELLOW'];

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
    tokens: new Map<string, Token[]>(),
    timeoutId: null,
    lastDiceRoll: -1,
    playerColors: new Map<string, PlayerColor>(),
    diceUsed: false,
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
      // Assign a color to the player
      const availableColors = COLORS.filter(
        color => ![...game.playerColors.values()].includes(color)
      );
      const playerColor = availableColors[0];

      game.players.push(playerId);
      game.sockets.set(playerId, ws);
      game.playerColors.set(playerId, playerColor);

      // Initialize tokens for the player
      game.tokens.set(playerId, [
        { id: `${playerId}_1`, position: 0 },
        { id: `${playerId}_2`, position: 0 },
        { id: `${playerId}_3`, position: 0 },
        { id: `${playerId}_4`, position: 0 },
      ]);

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

  const state = {
    gameId: game.id,
    players: game.players.map(playerId => ({
      id: playerId,
      color: game.playerColors.get(playerId),
      tokens: game.tokens.get(playerId) || [],
    })),
    currentTurn: game.currentTurn,
    diceRoll: game.lastDiceRoll,
    status: game.players.length < 2 ? 'WAITING' : 'PLAYING',
    diceUsed: game.diceUsed,
  };

  const message = JSON.stringify({
    type: 'GAME_STATE',
    state,
  });

  game.sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
};

export const getGame = (gameId: string) => games.get(gameId);
export const getAllGames = () => games;

export const startGame = (gameId: string) => {
  const game = games.get(gameId);
  if (!game || game.players.length < 2) return;

  game.currentTurn = 0;
  game.lastDiceRoll = -1;
  game.diceUsed = false;
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
  game.lastDiceRoll = -1;
  game.diceUsed = false;
  broadcastGameState(gameId);

  startTurnTimeout(gameId);
};

export const moveToken = (
  gameId: string,
  playerId: string,
  tokenId: string,
  steps: number
) => {
  const game = games.get(gameId);
  if (!game) return;

  // Validate turn and player
  if (getCurrentPlayer(gameId) !== playerId) {
    throw new Error('Not your turn');
  }

  const gameTokens = game.tokens.get(playerId) || [];
  const token = gameTokens.find(t => t.id === tokenId);

  if (!token) {
    throw new Error('Invalid token');
  }

  // Starting Token Rules
  const isStartingMove = token.position === 0 && steps === 6;
  const newPos = isStartingMove
    ? 1
    : Math.min(token.position + steps, WINNING_POSITION);

  // Prevent moving tokens that haven't started
  if (token.position === 0 && steps !== 6) {
    throw new Error('Need a 6 to start token');
  }

  // Capture Opponent Tokens Logic
  game.players.forEach(otherPlayerId => {
    if (otherPlayerId !== playerId) {
      const otherTokens = game.tokens.get(otherPlayerId) || [];
      otherTokens.forEach(otherToken => {
        // Check if token lands on opponent's token and not in safe zone
        if (otherToken.position === newPos && !SAFE_ZONES.has(newPos)) {
          // Knock out the token
          otherToken.position = 0;
        }
      });
    }
  });

  // Update token position
  token.position = newPos;

  game.diceUsed = true;

  // Winning Condition Check
  const playerTokens = game.tokens.get(playerId) || [];
  const allTokensAtEnd = playerTokens.every(
    t => t.position === WINNING_POSITION
  );

  if (allTokensAtEnd) {
    broadcastGameState(gameId);
    // Trigger win condition
    game.sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'WINNER',
            message: `${playerId} wins the game ${gameId}!`,
          })
        );
      }
    });
    removeGame(gameId);
  }

  // Determine next turn
  if (steps !== 6) {
    nextTurn(gameId);
  }

  broadcastGameState(gameId);
};

export const rollDice = (gameId: string, playerId: string): number => {
  const game = games.get(gameId);
  if (!game) throw new Error('Game not found');

  // Validate it's the player's turn
  if (getCurrentPlayer(gameId) !== playerId) {
    throw new Error('Not your turn');
  }

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  game.lastDiceRoll = diceRoll;

  console.log(`Player ${playerId} rolled ${diceRoll}`);
  game.diceUsed = false; //reset diceused

  const availabelTokens = game.tokens.get(playerId) || [];
  // Check if any token can be moved
  const canMove = availabelTokens.some(
    token =>
      (token.position === 0 && diceRoll === 6) ||
      (token.position > 0 && token.position + diceRoll <= WINNING_POSITION)
  );

  if (!canMove) {
    console.log(`No valid moves for player ${playerId}, passing turn.`);
    nextTurn(gameId);
  }

  broadcastGameState(gameId);
  return diceRoll;
};

export const startTurnTimeout = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  // Set timeout to automatically pass turn after 1 minute
  game.timeoutId = setTimeout(() => {
    nextTurn(gameId);
  }, 60000);
};

export const clearTurnTimeout = (gameId: string) => {
  const game = games.get(gameId);
  if (game && game.timeoutId) {
    clearTimeout(game.timeoutId);
    game.timeoutId = null;
  }
};

export const removeGame = (gameId: string) => {
  const game = games.get(gameId);
  if (!game) return;

  // Clear timeout if it exists
  if (game.timeoutId) {
    clearTimeout(game.timeoutId);
  }

  games.delete(gameId);
};
