// import React, { useEffect } from 'react';
// import useGameStore from '../stores/gameStore';

import { useEffect, useState } from 'react';
import useGameStore from '../stores/gameStore';

// const GameBoard: React.FC = () => {
//   const { gameState, rollDice, moveToken, canMoveToken } = useGameStore();
//   if (!gameState) {
//     return <div>Loading game...</div>;
//   }

//   const isCurrentPlayerTurn = (playerIndex: number) =>
//     playerIndex === gameState.currentTurn;

//   const getTokenStatus = (token: any, playerIndex: number) => {
//     const isCurrentPlayer = isCurrentPlayerTurn(playerIndex);
//     const canMove = isCurrentPlayer && canMoveToken(token.id);

//     if (canMove) {
//       return 'border-4 border-green-500 animate-pulse';
//     }

//     if (token.position === 0) {
//       return 'bg-gray-200 opacity-50';
//     }

//     return '';
//   };

//   return (
//     <div className="game-board">
//       <div className="players-section grid grid-cols-4 gap-4">
//         {gameState.players.map((player, index) => (
//           <div
//             key={player.id}
//             className={`player-card p-4 rounded-lg
//               ${
//                 isCurrentPlayerTurn(index)
//                   ? 'bg-green-50 border-2 border-green-300'
//                   : 'bg-gray-100'
//               }`}
//           >
//             <h2 className="text-xl font-bold mb-4">
//               Player {index + 1} ({player.color})
//             </h2>
//             <div className="tokens-grid grid grid-cols-2 gap-2">
//               {player.tokens.map(token => (
//                 <div
//                   key={token.id}
//                   className={`token p-2 rounded-md cursor-pointer
//                     transition-all duration-300
//                     ${getTokenStatus(token, index)}`}
//                   onClick={() => {
//                     if (canMoveToken(token.id)) {
//                       moveToken(token.id);
//                     }
//                   }}
//                 >
//                   <div className="flex justify-between">
//                     <span>Token {token.id.split('_')[1]}</span>
//                     <span>Pos: {token.position}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="game-controls mt-6 text-center">
//         <button
//           onClick={rollDice}
//           disabled={gameState.diceRoll !== -1 && gameState.diceRoll !== 6}
//           className="px-6 py-2 bg-blue-500 text-white rounded-lg
//             disabled:opacity-50 hover:bg-blue-600"
//         >
//           Roll Dice (Current Roll: {gameState.diceRoll})
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameBoard;

// Simple icon components to replace Heroicons
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
    />
  </svg>
);

const LudoBoard = () => {
  const {
    gameState,
    rollDice,
    moveToken,
    canMoveToken,
    playerId,
    hasValidMoves,
  } = useGameStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const handleRollDice = () => {
    // Check if previous roll has unmoved tokens
    if (gameState.diceRoll !== -1 && !gameState.diceUsed) {
      const hasUnmovedValidTokens = hasValidMoves();

      if (hasUnmovedValidTokens) {
        setErrorMessage('You must move a token before rolling again!');
        return;
      }
    }

    rollDice();
  };

  const handleTokenClick = (tokenId: string) => {
    // Prevent moving tokens if no dice roll
    if (gameState.diceRoll === -1) {
      setErrorMessage('Roll the dice first!');
      return;
    }

    // Prevent moving tokens after already used
    if (gameState.diceUsed) {
      setErrorMessage('Dice roll already used. Wait for next turn!');
      return;
    }

    // Validate token move
    if (!canMoveToken(tokenId)) {
      setErrorMessage(
        'Invalid token move. Check dice roll and token position!'
      );
      return;
    }

    moveToken(tokenId);
  };

  const getTokenStatus = (token: any, playerIndex: number) => {
    const isCurrentPlayer = playerIndex === gameState.currentTurn;
    const canMove = isCurrentPlayer && canMoveToken(token.id);

    if (canMove) {
      return ' animate-pulse cursor-pointer';
    }

    if (token.position === 0) {
      return ' opacity-50';
    }

    return '';
  };

  // Color mapping for Ludo board players
  const playerColors: { [key: number]: string } = {
    0: 'bg-red-500', // Red home
    1: 'bg-green-500', // Green home
    2: 'bg-yellow-500', // Yellow home
    3: 'bg-blue-500', // Blue home
  };

  const renderLudoBoard = () => {
    return (
      <div className="relative w-[600px] h-[600px] bg-white shadow-2xl rounded-3xl border-8 border-gray-200 p-4">
        {errorMessage && (
          <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {errorMessage}
          </div>
        )}

        {/* Central white area */}
        <div className="absolute inset-[10%] bg-gray-100 rounded-2xl"></div>

        {/* Player home bases */}
        {gameState.players.map((player, index) => {
          const homeBaseStyle = `absolute w-[240px] h-[240px] ${playerColors[index]} bg-opacity-20 rounded-2xl`;
          const positions = [
            { top: 0, left: 0 }, // Red (top-left)
            { top: 0, right: 0 }, // Green (top-right)
            { bottom: 0, left: 0 }, // Yellow (bottom-left)
            { bottom: 0, right: 0 }, // Blue (bottom-right)
          ];

          return (
            <div
              key={player.id}
              className={`${homeBaseStyle}`}
              style={{
                ...positions[index],
                transform: `rotate(${index * 90}deg)`,
              }}
            >
              <div className="flex flex-wrap justify-center items-center h-full p-4 gap-2">
                {player.tokens.map(token => (
                  <div
                    key={token.id}
                    className={`token p-2 rounded-full w-12 h-12 ${
                      playerColors[index]
                    }
                   transition-all duration-300  flex items-center justify-center text-white font-bold
                   ${getTokenStatus(token, index)}`}
                    onClick={() => {
                      if (index === gameState.currentTurn) {
                        handleTokenClick(token.id);
                      }
                    }}
                  >
                    {token.position === 0 ? (
                      <div className="w-12 h-12">
                        <HomeIcon />
                      </div>
                    ) : (
                      token.position
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Dice and Game Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <div
            className="w-24 h-24 bg-white shadow-lg rounded-xl flex items-center justify-center 
            text-4xl font-bold text-gray-700 border-4 border-gray-200"
          >
            {gameState.diceRoll === -1 ? '?' : gameState.diceRoll}
          </div>

          <button
            onClick={handleRollDice}
            disabled={gameState.diceRoll !== -1 && gameState.diceRoll !== 6}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg 
            disabled:opacity-50 hover:bg-blue-600 ${
              playerId != gameState.players[gameState.currentTurn].id
                ? 'invisible'
                : 'visible'
            }`}
          >
            {gameState.diceRoll === -1 ? <PlayIcon /> : <StopIcon />}
            Roll Dice
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ludo Master</h1>
        <p className="text-gray-600">Current Game Code: {gameState.gameId}</p>
        <p className="text-gray-600">
          Current Turn: Player {gameState.currentTurn + 1}
        </p>
      </div>

      {renderLudoBoard()}
    </div>
  );
};

export default LudoBoard;
