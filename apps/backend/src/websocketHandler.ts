import WebSocket from 'ws';
import { z } from 'zod';
import {
  createGame,
  joinGame,
  broadcastGameState,
  getCurrentPlayer,
  startGame,
  moveToken,
  rollDice,
} from './gameManager';

// Message type validation schemas
const BaseMessageSchema = z.object({
  type: z.string(),
  gameId: z.string(),
  playerId: z.string(),
});

const JoinGameSchema = BaseMessageSchema.extend({
  type: z.literal('JOIN_GAME'),
});

const RollDiceSchema = BaseMessageSchema.extend({
  type: z.literal('ROLL_DICE'),
});

const MoveTokenSchema = BaseMessageSchema.extend({
  type: z.literal('MOVE_TOKEN'),
  tokenId: z.string(),
  steps: z.number().min(1).max(6),
});

// Union type for all possible message types
const MessageSchema = z.discriminatedUnion('type', [
  JoinGameSchema,
  RollDiceSchema,
  MoveTokenSchema,
]);

export function handleWebSocketMessage(ws: WebSocket, data: string) {
  try {
    // Parse the incoming message
    const message = JSON.parse(data);

    // Validate the message structure
    const validatedMessage = MessageSchema.parse(message);

    switch (validatedMessage.type) {
      case 'JOIN_GAME':
        handleJoinGame(ws, validatedMessage);
        break;
      case 'ROLL_DICE':
        handleRollDice(ws, validatedMessage);
        break;
      case 'MOVE_TOKEN':
        handleMoveToken(ws, validatedMessage);
        break;
      default:
        sendErrorMessage(ws, 'Unknown message type');
    }
  } catch (error) {
    // Handle parsing or validation errors
    if (error instanceof z.ZodError) {
      sendErrorMessage(ws, 'Invalid message format', error.errors);
      console.error('Validation Error:', error.errors);
    } else if (error instanceof Error) {
      sendErrorMessage(ws, error.message);
      console.error('Processing Error:', error);
    } else {
      sendErrorMessage(ws, 'Unexpected error occurred');
      console.error('Unknown Error:', error);
    }
  }
}

function handleJoinGame(
  ws: WebSocket,
  message: z.infer<typeof JoinGameSchema>
) {
  const { gameId, playerId } = message;

  const role = joinGame(gameId, playerId, ws);

  if (role) {
    if (role === 'player' && getCurrentPlayer(gameId) === playerId) {
      startGame(gameId);
    }
    broadcastGameState(gameId);
  } else {
    sendErrorMessage(ws, 'Failed to join game');
  }
}

function handleRollDice(
  ws: WebSocket,
  message: z.infer<typeof RollDiceSchema>
) {
  const { gameId, playerId } = message;

  try {
    const diceRoll = rollDice(gameId, playerId);

    // Send dice roll back to the client
    ws.send(
      JSON.stringify({
        type: 'DICE_ROLLED',
        diceRoll,
      })
    );

    // Broadcast updated game state
    broadcastGameState(gameId);
  } catch (error) {
    sendErrorMessage(
      ws,
      error instanceof Error ? error.message : 'Dice roll failed'
    );
  }
}

function handleMoveToken(
  ws: WebSocket,
  message: z.infer<typeof MoveTokenSchema>
) {
  const { gameId, playerId, tokenId, steps } = message;

  try {
    moveToken(gameId, playerId, tokenId, steps);
    broadcastGameState(gameId);
  } catch (error) {
    sendErrorMessage(
      ws,
      error instanceof Error ? error.message : 'Token move failed'
    );
  }
}

function sendErrorMessage(ws: WebSocket, message: string, details?: any) {
  ws.send(
    JSON.stringify({
      type: 'ERROR',
      message,
      details: details || null,
    })
  );
}

export const messageHandlers = {
  handleWebSocketMessage,
};
