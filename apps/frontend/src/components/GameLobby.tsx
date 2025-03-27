import React, { useState, useEffect } from 'react';
import useGameStore from '../stores/gameStore';
import { PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';

const GameLobby: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const { createGame, joinGame, connectWebSocket } = useGameStore();

  useEffect(() => {
    connectWebSocket();
  }, []);

  const handleCreateGame = async () => {
    const newGameId = await createGame();
    setGameId(newGameId);
  };

  const handleJoinGame = () => {
    if (gameId) {
      joinGame(gameId);
    }
  };

  const copyGameId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      alert('Game ID copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Lobby
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleCreateGame}
            className="w-full bg-ludo-blue text-white py-2 rounded-lg 
            flex items-center justify-center hover:bg-blue-600 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New
          </button>

          {gameId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-semibold text-gray-700">
                  {gameId}
                </span>
                <button
                  onClick={copyGameId}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this Game ID with your friends
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Game ID"
              value={gameId || ''}
              onChange={e => setGameId(e.target.value)}
              className="flex-grow p-2 border rounded-lg"
            />
            <button
              onClick={handleJoinGame}
              disabled={!gameId}
              className="bg-ludo-green text-white px-4 py-2 rounded-lg 
              disabled:opacity-50 hover:bg-green-600 transition"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
