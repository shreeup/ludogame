// Simple icon components to replace Heroicons
import React, { useEffect, useState } from 'react';
import useGameStore from '../stores/gameStore';
import { HomeIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon, PlayIcon, StopIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';
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
    if (!gameState || gameState.status === 'FINISHED') return;
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
    if (!gameState || gameState.status === 'FINISHED') return;
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
      {gameState?.status === 'FINISHED' && gameState?.winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-bold z-10">
          🎉 Winner: {gameState.winner} 🎉
        </div>
      )}
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
                  {val == 6 && (
                    <StarIcon
                      key={'safe_6'}
                      className="absolute w-6 h-6"
                      style={{
                        color: 'black',
                      }}
                    />
                  )}
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
                      key={`player_1_token_${ix}`}
                      className={` rounded-full  transition-all duration-300  flex items-center justify-center text-white font-bold  ${
                        playerColors[1]
                      } ${getTokenStatus(tkn, ix)}`}
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
                  {val == 20 && (
                    <StarIcon
                      key={'safe_20'}
                      className="absolute w-6 h-6"
                      style={{
                        color: 'black',
                      }}
                    />
                  )}
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
                      cellTokenMapping[val].tokens.map((_, index) => (
                        // <StarIcon
                        //   key={index}
                        //   className="absolute w-6 h-6"
                        //   style={{
                        //     color: 'black',
                        //     zIndex: 10000,
                        //     left: 'calc(100% - 30px)',
                        //     top: `calc(100% - ${index * 6}px)`,
                        //   }}
                        // />
                        <></>
                      ))}
                    <span
                      style={{
                        color: 'black',
                        position: 'absolute',
                        top: `${
                          val == 2000
                            ? 'calc(100% - 10px)'
                            : val == 3000
                            ? 'calc(100% - 30px)'
                            : val == 1000
                            ? ' unset'
                            : val == 4000
                            ? ' unset'
                            : ' unset'
                        }`,
                        right: `${
                          val == 2000
                            ? ' unset'
                            : val == 3000
                            ? ' unset'
                            : val == 1000
                            ? ' unset'
                            : val == 4000
                            ? 'calc(100% - 40px)'
                            : 'unset'
                        }`,
                        left: `${
                          val == 2000
                            ? 'calc(100% - 30px)'
                            : val == 3000
                            ? 'calc(100% - 5px)'
                            : val == 1000
                            ? 'calc(100% - 10px)'
                            : val == 4000
                            ? 'unset'
                            : 'unset'
                        }`,
                        bottom: `${
                          val == 2000
                            ? 'calc(100% - 10px)'
                            : val == 3000
                            ? 'unset '
                            : val == 1000
                            ? 'calc(100% - 40px)'
                            : val == 4000
                            ? 'calc(100% - 20px)'
                            : ''
                        }`,
                      }}
                    >
                      {cellTokenMapping[val] &&
                        cellTokenMapping[val].tokens.length}
                    </span>
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
                    [43, 44, 45, 46, 47, 53].indexOf(val) >= 0 ? 'yellow' : ''
                  }`}
                >
                  {val == 53 && (
                    <StarIcon
                      key={'safe_53'}
                      className="absolute w-6 h-6"
                      style={{
                        color: 'black',
                      }}
                    />
                  )}
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
                      key={`player_2_token_${ix}`}
                      className={` rounded-full  transition-all duration-300  flex items-center justify-center text-white font-bold  ${
                        playerColors[2]
                      } ${getTokenStatus(tkn, ix)}`}
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
                  {val == 67 && (
                    <StarIcon
                      key={'safe_'}
                      className="absolute w-6 h-6"
                      style={{
                        color: 'black',
                      }}
                    />
                  )}
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
                      key={`player_3_token_${ix}`}
                      className={` rounded-full  transition-all duration-300  flex items-center justify-center text-white font-bold  ${
                        playerColors[3]
                      } ${getTokenStatus(tkn, ix)}`}
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
    </div>
  );
};

export default LudoBoard;
