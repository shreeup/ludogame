import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import useWebSocket from '../hooks/useWebsocket';

interface LobbyProps {
  setGameId: (id: string) => void;
  setPlayerId: (id: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ setGameId, setPlayerId }) => {
  const [inputGameId, setInputGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const { sendMessage } = useWebSocket(`${API_BASE_URL}`);

  const handleCreateGame = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-game`);
      const data = await response.json();
      setGameId(data.gameId);
      debugger;
      const response1 = await fetch(`${API_BASE_URL}/get-game/${data.gameId}`);
      const data1 = await response1.json();
      console.log(data1);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = () => {
    if (!inputGameId.trim() || !playerName.trim()) return;
    setGameId(inputGameId);
    setPlayerId(playerName);
    sendMessage({
      type: 'JOIN_GAME',
      gameId: inputGameId,
      playerId: playerName,
    });
  };

  return (
    <div>
      <h2>Welcome to Ludo</h2>
      <button onClick={handleCreateGame}>Create Game</button>

      <h3>Join Game</h3>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={inputGameId}
        onChange={e => setInputGameId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoinGame}>Join Game</button>
    </div>
  );
};

export default Lobby;
