import express from 'express';
import { Request, Response, NextFunction } from 'express';

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import {
  createGame,
  joinGame,
  broadcastGameState,
  getCurrentPlayer,
  startGame,
  nextTurn,
  moveToken,
  removeGame,
  getAllGames,
  clearTurnTimeout,
  getGame,
} from './gameManager';
import cors from 'cors';

const app = express();
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
}, cors({ maxAge: 84600 }));
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', data => {
    const { type, gameId, playerId } = JSON.parse(data.toString());
    console.log(`${type} new message came in`);
    if (type === 'JOIN_GAME') {
      const role = joinGame(gameId, playerId, ws as unknown as WebSocket);
      if (role) {
        if (role === 'player' && getCurrentPlayer(gameId) === undefined) {
          startGame(gameId); // Start game when first player joins
        }
        broadcastGameState(gameId);
      }
    }
    if (type === 'ROLL_DICE') {
      const currentPlayer = getCurrentPlayer(gameId);
      if (currentPlayer !== playerId) {
        ws.send(JSON.stringify({ error: 'Not your turn!' }));
        return;
      }

      const diceRoll = Math.floor(Math.random() * 6) + 1;
      moveToken(gameId, playerId, diceRoll); // Move the token
      broadcastGameState(gameId);

      if (diceRoll !== 6) nextTurn(gameId); // Move to next player unless a 6 is rolled

      // Stop the timeout because the player has made a move
      clearTurnTimeout(gameId);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected`);

    // Find the game and player associated with this socket
    let gameIdToRemove: string | null = null;
    let playerIdToRemove: string | null = null;
    let games = getAllGames();

    games.forEach((game, gameId) => {
      for (const [playerId, socket] of game.sockets.entries()) {
        if (socket === (ws as unknown as WebSocket)) {
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

      // If only one player remains, they win
      if (game.players.length === 1) {
        const winner = game.players[0];
        game.sockets
          .get(winner)
          ?.send(
            JSON.stringify({ type: 'WINNER', message: `${winner} wins!` })
          );

        removeGame(gameIdToRemove); // End game
      } else {
        // Move to the next player if it was their turn
        if (game.currentTurn >= game.players.length) {
          game.currentTurn = 0;
        }

        broadcastGameState(gameIdToRemove);
      }
    }
  });
});

app.get('/create-game', (_, res) => {
  const gameId = createGame();
  res.json({ gameId });
});

app.get('/get-game/:id', (req, res) => {
  const gameId = req.params.id;
  const gameData = getGame(gameId);
  res.json({ gameData });
});
// app.post(
//   '/join-game',
//   express.json(),
//   async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     const { gameId, playerId } = req.body;
//     if (!gameId || !playerId)
//       return res.status(400).json({ error: 'Missing gameId or playerId' });

//     const role = joinGame(gameId, playerId);
//     if (!role) return res.status(404).json({ error: 'Game not found' });

//     res.json({ role });
//   }
// );

server.listen(5001, () => console.log('Server running on port 5001'));
