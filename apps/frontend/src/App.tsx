import React from 'react';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import useGameStore from './stores/gameStore';

const App: React.FC = () => {
  const { gameState } = useGameStore();

  return (
    <div className="bg-gray-100">
      {gameState ? <GameBoard /> : <GameLobby />}
      <div className="text-center">
        &copy; reserved {new Date().getFullYear()} <br />
        Developed By Shree with help of Open and Free Resources
      </div>
    </div>
  );
};

export default App;
