import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import useWebSocket from '../hooks/useWebsocket';

interface GameBoardProps {
  gameId: string;
  playerId: string | null;
}

interface GameState {
  players: Record<string, { position: number; color: string }>;
  currentTurn: string;
  diceValue: number | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameId, playerId }) => {
  const { sendMessage, lastMessage } = useWebSocket(`${API_BASE_URL}`);
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    currentTurn: '',
    diceValue: null,
  });

  // Listen for game state updates
  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage);
      if (messageData.type === 'GAME_UPDATE' && messageData.gameId === gameId) {
        setGameState(messageData.state);
      }
    }
  }, [lastMessage, gameId]);

  // Handle rolling the dice
  const handleRollDice = () => {
    if (playerId === gameState.currentTurn) {
      sendMessage({ type: 'ROLL_DICE', gameId, playerId });
    }
  };

  return (
    <div>
      <h2>Game ID: {gameId}</h2>
      <h3>Current Turn: {gameState.currentTurn}</h3>
      <h3>Dice Roll: {gameState.diceValue ?? 'Roll the dice!'}</h3>

      <button
        onClick={handleRollDice}
        disabled={playerId !== gameState.currentTurn}
      >
        Roll Dice
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {Object.entries(gameState.players).map(([id, { position, color }]) => (
          <div
            key={id}
            style={{ background: color, padding: '10px', borderRadius: '5px' }}
          >
            <p>Player: {id}</p>
            <p>Position: {position}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
