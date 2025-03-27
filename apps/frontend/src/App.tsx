import React from 'react';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import useGameStore from './stores/gameStore';

const App: React.FC = () => {
  const { gameState } = useGameStore();

  return gameState ? <GameBoard /> : <GameLobby />;
};

export default App;
