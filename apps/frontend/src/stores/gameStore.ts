import { create } from 'zustand';
import { z } from 'zod';
const WINNING_POSITION = 57;

// Refined schemas for type safety
const TokenSchema = z.object({
  id: z.string(),
  position: z.number(),
  tokencolor: z.string(),
});

const PlayerSchema = z.object({
  id: z.string(),
  color: z.string(),
  tokens: z.array(TokenSchema),
});

const GameStateSchema = z.object({
  gameId: z.string(),
  players: z.array(PlayerSchema),
  currentTurn: z.number(),
  diceRoll: z.number(),
  diceUsed: z.boolean(),
  status: z.enum(['WAITING', 'PLAYING', 'FINISHED']),
});

type GameState = z.infer<typeof GameStateSchema>;

interface GameStore {
  gameState: GameState | null;
  playerId: string | null;
  socket: WebSocket | null;

  createGame: () => Promise<string>;
  joinGame: (gameId: string) => void;
  rollDice: () => void;
  moveToken: (tokenId: string) => void;
  connectWebSocket: () => void;
  handleMessage: (event: MessageEvent) => void;
  canMoveToken: (tokenId: string) => boolean;
  hasValidMoves: () => boolean;
}

const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  playerId: null,
  socket: null,

  createGame: async () => {
    const response = await fetch('http://localhost:5001/create-game');
    const { gameId } = await response.json();
    return gameId;
  },

  joinGame: (gameId: string) => {
    const socket = get().socket;
    const playerId = crypto.randomUUID();

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'JOIN_GAME',
          gameId,
          playerId,
        })
      );

      set({ playerId });
    }
  },

  rollDice: () => {
    const { socket, gameState, playerId } = get();

    if (!socket || !gameState || !playerId) return;

    const currentPlayer = gameState.players[gameState.currentTurn];

    if (currentPlayer.id === playerId) {
      // Check if previous dice roll hasn't been used
      if (gameState.diceRoll !== -1 && !gameState.diceUsed) {
        // Check if there are any valid moves remaining
        if (get().hasValidMoves()) {
          console.error('Must move a token before rolling again');
          return;
        }
      }

      socket.send(
        JSON.stringify({
          type: 'ROLL_DICE',
          gameId: gameState.gameId,
          playerId,
        })
      );

      set(state => ({
        gameState: state.gameState
          ? { ...state.gameState, diceUsed: false }
          : null,
      }));
    } else {
      console.error('Not your turn to roll dice');
    }
  },

  canMoveToken: (tokenId: string) => {
    const { gameState, playerId } = get();

    if (!gameState || !playerId) return false;

    const currentPlayer = gameState.players[gameState.currentTurn];
    if (currentPlayer.id !== playerId) return false;

    // Require dice roll and not already used
    if (gameState.diceRoll === -1 || gameState.diceUsed) return false;

    const token = currentPlayer.tokens.find(t => t.id === tokenId);
    if (!token) return false;

    // Starting token requires 6
    if (token.position === 0 && gameState.diceRoll !== 6) return false;

    // Token already at winning position
    if (token.position === WINNING_POSITION) return false;

    // Token + current roll > winning position
    if (token.position + gameState.diceRoll > WINNING_POSITION) return false;

    return true;
  },

  moveToken: (tokenId: string) => {
    const { socket, gameState, playerId } = get();

    if (!get().canMoveToken(tokenId)) {
      console.error('Invalid token move');
      return;
    }

    if (socket && gameState && playerId) {
      socket.send(
        JSON.stringify({
          type: 'MOVE_TOKEN',
          gameId: gameState.gameId,
          playerId,
          tokenId,
          steps: gameState.diceRoll,
        })
      );

      set(state => ({
        gameState: state.gameState
          ? { ...state.gameState, diceUsed: true }
          : null,
      }));
    }
  },
  connectWebSocket: () => {
    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('WebSocket connected');
      set({ socket });
    };

    socket.onmessage = event => {
      get().handleMessage(event);
    };

    socket.onerror = error => {
      console.error('WebSocket Error:', error);
    };
  },

  handleMessage: event => {
    try {
      const message = JSON.parse(event.data);
      const currentState = get().gameState;
      switch (message.type) {
        case 'GAME_STATE':
          set({ gameState: message.state });
          break;
        case 'DICE_ROLLED':
          console.log('Dice rolled:', message.diceRoll);
          break;
        case 'TURN_PASSED':
          console.log(`Turn passed to player: ${message.nextPlayerId}`);

          if (currentState) {
            set({
              gameState: {
                ...currentState,
                currentTurn: message.nextPlayerId,
              },
            });
          }
          break;
        case 'ERROR':
          console.error('Game Error:', message.message);
          break;
        case 'WINNER':
          console.log('Game Winner:', message.message);
          break;
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  },

  hasValidMoves: () => {
    const { gameState, playerId } = get();

    if (!gameState || !playerId) return false;

    const currentPlayer = gameState.players[gameState.currentTurn];

    // If it's not the current player's turn, no moves are valid
    if (currentPlayer.id !== playerId) return false;

    // No dice rolled or dice already used
    if (gameState.diceRoll === -1 || gameState.diceUsed) return false;

    // Check if any token can be moved
    return currentPlayer.tokens.some(token => {
      // Starting token requires 6
      if (token.position === 0 && gameState.diceRoll !== 6) return false;

      // Token already at winning position
      if (token.position === WINNING_POSITION) return false;

      // Token + current roll > winning position
      if (token.position + gameState.diceRoll > WINNING_POSITION) return false;

      return true;
    });
  },
}));

export default useGameStore;
