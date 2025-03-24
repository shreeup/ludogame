import { useState } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

const App = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  return (
    <div>
      {gameId ? (
        <GameBoard gameId={gameId} playerId={playerId} />
      ) : (
        <Lobby setGameId={setGameId} setPlayerId={setPlayerId} />
      )}
    </div>
  );
};

export default App;
