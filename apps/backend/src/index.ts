import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { createGame, removeGame, getAllGames, getGame } from './gameManager';
import { messageHandlers } from './websocketHandler'; // New import

const app = express();

// Middleware setup
app.use(cors({ maxAge: 84600 }));
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', ws => {
  console.log('New client connected');

  // Use the new message handler
  ws.on('message', data => {
    try {
      messageHandlers.handleWebSocketMessage(ws, data.toString());
    } catch (error) {
      console.error('WebSocket message handling error:', error);
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: 'Internal server error',
        })
      );
    }
  });

  // Existing disconnection logic
  ws.on('close', () => {
    console.log('Client disconnected');

    let gameIdToRemove: string | null = null;
    let playerIdToRemove: string | null = null;
    const games = getAllGames();

    games.forEach((game, gameId) => {
      for (const [playerId, socket] of game.sockets.entries()) {
        if (socket === ws) {
          gameIdToRemove = gameId;
          playerIdToRemove = playerId;
          break;
        }
      }
    });

    if (gameIdToRemove && playerIdToRemove) {
      const game = games.get(gameIdToRemove);
      if (!game) return;

      // Remove player from game
      game.players = game.players.filter(p => p !== playerIdToRemove);
      game.sockets.delete(playerIdToRemove);

      // Handle game end conditions
      if (game.players.length === 1) {
        const winner = game.players[0];
        game.sockets.get(winner)?.send(
          JSON.stringify({
            type: 'WINNER',
            message: `${winner} wins!`,
          })
        );
        removeGame(gameIdToRemove);
      } else {
        // Adjust turn if necessary
        if (game.currentTurn >= game.players.length) {
          game.currentTurn = 0;
        }
      }
    }
  });

  ws.on('error', err => {
    console.error('WebSocket Server Error:', err);
  });
});

// Game creation and management routes
app.get('/create-game', (_, res) => {
  const gameId = createGame();
  res.json({ gameId });
});

app.get('/get-game/:id', (req, res) => {
  const gameId = req.params.id;
  const gameData = getGame(gameId);
  res.json({ gameData });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
