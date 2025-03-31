// import React, { useEffect } from 'react';
// import useGameStore from '../stores/gameStore';

// import { useEffect, useState } from 'react';
// import useGameStore from '../stores/gameStore';
// import { string } from 'zod';

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
import React, { useEffect, useState } from 'react';
import useGameStore from '../stores/gameStore';
import { HomeIcon } from '@heroicons/react/24/solid';
import {
  UserCircleIcon,
  StarIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/solid';
// const PlayIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//     />
//   </svg>
// );

//const playerColors = ['red', 'green', 'yellow', 'blue'];
const calculateTokenPosition = (
  token: { position: number },
  playerColor: string
) => {
  // Calculate board path for each player
  const playerPaths: Record<string, number[]> = {
    RED: [
      -1, 20, 21, 22, 23, 24, 16, 13, 10, 7, 4, 1, 2, 3, 6, 9, 12, 15, 18, 37,
      38, 39, 40, 41, 42, 48, 54, 53, 52, 51, 50, 49, 57, 60, 63, 66, 69, 72,
      71, 70, 67, 64, 61, 58, 55, 36, 35, 34, 33, 32, 31, 25, 26, 27, 28, 29,
      30, 2000,
    ],
    GREEN: [
      -1, 6, 9, 12, 15, 18, 37, 38, 39, 40, 41, 42, 48, 54, 53, 52, 51, 50, 49,
      57, 60, 63, 66, 69, 72, 71, 70, 67, 64, 61, 58, 55, 36, 35, 34, 33, 32,
      31, 25, 19, 20, 21, 22, 23, 24, 16, 13, 10, 7, 4, 1, 2, 5, 8, 11, 14, 17,
      3000,
    ],
    YELLOW: [
      -1, 53, 52, 51, 50, 49, 57, 60, 63, 66, 69, 72, 71, 70, 67, 64, 61, 58,
      55, 36, 35, 34, 33, 32, 31, 25, 19, 20, 21, 22, 23, 24, 16, 13, 10, 7, 4,
      1, 2, 3, 6, 9, 12, 15, 18, 37, 38, 39, 40, 41, 42, 48, 47, 46, 45, 44, 43,
      4000,
    ],
    BLUE: [
      -1, 67, 64, 61, 58, 55, 36, 35, 34, 33, 32, 31, 25, 19, 20, 21, 22, 23,
      24, 16, 13, 10, 7, 4, 1, 2, 3, 6, 9, 12, 15, 18, 37, 38, 39, 40, 41, 42,
      48, 54, 53, 52, 51, 50, 49, 57, 60, 63, 66, 69, 72, 71, 68, 65, 62, 59,
      56, 1000,
    ],
  };
  // Adjust position based on player's path and token's current position
  const path = playerPaths[playerColor];
  return path[token.position];
};

const LudoBoard = () => {
  const {
    gameState,
    rollDice,
    moveToken,
    canMoveToken,
    playerId,
    hasValidMoves,
  } = useGameStore();

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cellTokenMapping, setCellTokenMapping] = useState<
    Record<
      number,
      {
        count: number;
        tokens: { id: string; position: number; tokencolor: string }[];
      }
    >
  >({});

  useEffect(() => {
    const newMapping: Record<
      number,
      {
        count: number;
        tokens: { id: string; position: number; tokencolor: string }[];
      }
    > = {};

    gameState.players.forEach(player => {
      player.tokens.forEach(tkn => {
        const tknPos = calculateTokenPosition(tkn, player.color);

        if (!newMapping[tknPos]) {
          newMapping[tknPos] = { count: 0, tokens: [] };
        }

        newMapping[tknPos].count += 1;
        newMapping[tknPos].tokens.push(tkn);
      });
    });

    setCellTokenMapping(_ => {
      return newMapping;
    });
    console.log(cellTokenMapping);
  }, [gameState]);

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
    if (gameState.diceRoll === -1) {
      setErrorMessage('Roll the dice first!');
      return;
    }

    if (gameState.diceUsed) {
      setErrorMessage('Dice roll already used. Wait for next turn!');
      return;
    }

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

  //Color mapping for Ludo board players
  const playerColors: { [key: number]: string } = {
    0: 'bg-red-500', // Green home
    1: 'bg-green-500', // Red home
    2: 'bg-blue-500', // Yellow home
    3: 'bg-yellow-500', // Blue home
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {errorMessage && (
        <div className="fixed top-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ludo Master</h1>
        <p className="text-gray-600">Current Game Code: {gameState.gameId}</p>
        <p className="text-gray-600">
          Current Turn: Player {gameState.currentTurn + 1}
        </p>
      </div>

      <div className=" transform flex items-center space-x-4">
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
      <div className="container card relative">
        <div className="container-row1 clearfix">
          <div className="row1-col1 red">
            <div className="row1-col1-child clearfix white">
              {gameState.players[0].tokens.map((tkn, ix) => {
                return (
                  <div
                    key={`player_0_token_${ix}`}
                    className={` rounded-full  transition-all duration-300  flex items-center justify-center text-white font-bold  ${
                      playerColors[0]
                    } ${getTokenStatus(tkn, ix)}`}
                    onClick={() => {
                      if (0 === gameState.currentTurn) {
                        handleTokenClick(tkn.id);
                      }
                    }}
                  >
                    {tkn.position === 0 ? (
                      <div className="w-12 h-12">
                        <HomeIcon />
                      </div>
                    ) : (
                      tkn.position
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="row1-col2 clearfix">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((val, _) => {
              return (
                <div
                  data-cell={`${val}`}
                  key={`${val}`}
                  className={`${
                    [5, 6, 8, 11, 14, 17].indexOf(val) >= 0 ? 'green' : ''
                  }`}
                >
                  {cellTokenMapping[val] &&
                    cellTokenMapping[val].tokens.map((token, index) => (
                      <UserCircleIcon
                        key={index}
                        className="absolute w-6 h-6"
                        style={{
                          // top: `${index * 2}px`, // Stack tokens with slight offset
                          color: token.tokencolor,
                        }}
                        onClick={() => {
                          const firstCurrentPlayerToken = cellTokenMapping[
                            val
                          ].tokens.find(
                            token =>
                              token.tokencolor ===
                              gameState.players[gameState.currentTurn].color // Ensure you have `currentPlayerColor` in state
                          );
                          if (firstCurrentPlayerToken)
                            handleTokenClick(firstCurrentPlayerToken.id);
                        }}
                      />
                    ))}{' '}
                  {val}
                </div>
              );
            })}
          </div>
          <div className="row1-col3 green">
            <div className="row1-col3-child clearfix white">
              {gameState.players.length > 1 &&
                gameState.players[1].tokens.map((tkn, ix) => {
                  return (
                    <div
                      className={`${playerColors[1]} ${getTokenStatus(
                        tkn,
                        ix
                      )}`}
                      onClick={() => {
                        if (1 === gameState.currentTurn) {
                          handleTokenClick(tkn.id);
                        }
                      }}
                    >
                      {tkn.position === 0 ? (
                        <div className="w-12 h-12">
                          <HomeIcon />
                        </div>
                      ) : (
                        tkn.position
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="container-row2 clearfix">
          <div className="row2-col1 clearfix">
            {[
              19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
              35, 36,
            ].map((val, _) => {
              return (
                <div
                  data-cell={`${val}`}
                  key={`${val}`}
                  className={`${
                    [20, 26, 27, 28, 29, 30].indexOf(val) >= 0 ? 'red' : ''
                  }`}
                >
                  {cellTokenMapping[val] &&
                    cellTokenMapping[val].tokens.map((token, index) => (
                      <UserCircleIcon
                        key={index}
                        className="absolute w-6 h-6"
                        style={{
                          // top: `${index * 2}px`, // Stack tokens with slight offset
                          color: token.tokencolor,
                        }}
                        onClick={() => {
                          const firstCurrentPlayerToken = cellTokenMapping[
                            val
                          ].tokens.find(
                            token =>
                              token.tokencolor ===
                              gameState.players[gameState.currentTurn].color // Ensure you have `currentPlayerColor` in state
                          );
                          if (firstCurrentPlayerToken)
                            handleTokenClick(firstCurrentPlayerToken.id);
                        }}
                      />
                    ))}{' '}
                  {val}
                </div>
              );
            })}
          </div>
          <div className="row2-col2">
            <div className="contain-triangles">
              {[2000, 1000, 4000, 3000].map((val, _) => {
                return (
                  <div
                    className={`${val == 2000 ? 'triangle-right' : ''} ${
                      val == 1000 ? 'triangle-up' : ''
                    } ${val == 4000 ? 'triangle-left' : ''} ${
                      val == 3000 ? 'triangle-down' : ''
                    } `}
                    data-cell={val}
                    key={val + '_triangle'}
                  >
                    {cellTokenMapping[val] &&
                      cellTokenMapping[val].tokens.map((token, index) => (
                        <StarIcon
                          key={index}
                          className="absolute w-6 h-6"
                          style={{
                            top: `${index * 2}px`, // Stack tokens with slight offset
                            color: token.tokencolor,
                          }}
                          onClick={() => {
                            const firstCurrentPlayerToken = cellTokenMapping[
                              val
                            ].tokens.find(
                              token =>
                                token.tokencolor ===
                                gameState.players[gameState.currentTurn].color // Ensure you have `currentPlayerColor` in state
                            );
                            if (firstCurrentPlayerToken)
                              handleTokenClick(firstCurrentPlayerToken.id);
                          }}
                        />
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="row2-col3 clearfix">
            {[
              37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
              53, 54,
            ].map((val, _) => {
              return (
                <div
                  data-cell={`${val}`}
                  key={`${val}`}
                  className={`${
                    [43, 44, 45, 46, 47, 53].indexOf(val) >= 1 ? 'yellow' : ''
                  }`}
                >
                  {cellTokenMapping[val] &&
                    cellTokenMapping[val].tokens.map((token, index) => (
                      <UserCircleIcon
                        key={index}
                        className="absolute w-6 h-6"
                        style={{
                          // top: `${index * 2}px`, // Stack tokens with slight offset
                          color: token.tokencolor,
                        }}
                        onClick={() => {
                          const firstCurrentPlayerToken = cellTokenMapping[
                            val
                          ].tokens.find(
                            token =>
                              token.tokencolor ===
                              gameState.players[gameState.currentTurn].color // Ensure you have `currentPlayerColor` in state
                          );
                          if (firstCurrentPlayerToken)
                            handleTokenClick(firstCurrentPlayerToken.id);
                        }}
                      />
                    ))}{' '}
                  {val}
                </div>
              );
            })}
          </div>
        </div>

        <div className="container-row3 clearfix">
          <div className="row3-col1 blue">
            <div className="row3-col1-child clearfix white">
              {gameState.players.length > 2 &&
                gameState.players[2].tokens.map((tkn, ix) => {
                  return (
                    <div
                      className={`${playerColors[2]} ${getTokenStatus(
                        tkn,
                        ix
                      )}`}
                      onClick={() => {
                        if (2 === gameState.currentTurn) {
                          handleTokenClick(tkn.id);
                        }
                      }}
                    >
                      {tkn.position === 0 ? (
                        <div className="w-12 h-12">
                          <HomeIcon />
                        </div>
                      ) : (
                        tkn.position
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="row3-col2 clearfix">
            {[
              55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
              71, 72,
            ].map((val, _) => {
              return (
                <div
                  data-cell={`${val}`}
                  key={`${val}`}
                  className={`${
                    [56, 59, 62, 65, 67, 68].indexOf(val) >= 0 ? 'blue' : ''
                  }`}
                >
                  {cellTokenMapping[val] &&
                    cellTokenMapping[val].tokens.map((token, index) => (
                      <UserCircleIcon
                        key={index}
                        className="absolute w-6 h-6"
                        style={{
                          //top: `${index * 2}px`, // Stack tokens with slight offset
                          color: token.tokencolor,
                        }}
                        onClick={() => {
                          const firstCurrentPlayerToken = cellTokenMapping[
                            val
                          ].tokens.find(
                            token =>
                              token.tokencolor ===
                              gameState.players[gameState.currentTurn].color // Ensure you have `currentPlayerColor` in state
                          );
                          if (firstCurrentPlayerToken)
                            handleTokenClick(firstCurrentPlayerToken.id);
                        }}
                      />
                    ))}
                  {val}
                </div>
              );
            })}
          </div>
          <div className="row3-col3 yellow">
            <div className="row3-col3-child clearfix white">
              {gameState.players.length > 3 &&
                gameState.players[3].tokens.map((tkn, ix) => {
                  return (
                    <div
                      className={`${playerColors[3]} ${getTokenStatus(
                        tkn,
                        ix
                      )}`}
                      onClick={() => {
                        if (3 === gameState.currentTurn) {
                          handleTokenClick(tkn.id);
                        }
                      }}
                    >
                      {tkn.position === 0 ? (
                        <div className="w-12 h-12">
                          <HomeIcon />
                        </div>
                      ) : (
                        tkn.position
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div>Copyrights reserved {new Date().getFullYear()}</div>
    </div>
  );
};

export default LudoBoard;
