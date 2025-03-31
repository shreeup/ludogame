// import React from 'react';
// import { useGameStore } from '../stores/gameStore';

// const LudoBoard: React.FC = () => {
//   const { gameId, players, currentTurn, positions, rollDice } = useGameStore();

//   return (
//     <div classNameName="bg-ludo-board p-4 rounded-lg">
//       <div classNameName="mb-4">
//         <h2 classNameName="text-xl font-bold">Game ID: {gameId}</h2>
//         <p>Current Turn: {players[currentTurn]}</p>
//       </div>

//       <div classNameName="grid grid-cols-4 gap-2">
//         {players.map((player, index) => (
//           <div
//             key={player}
//             classNameName={`p-2 rounded ${
//               index === currentTurn ? 'bg-yellow-200' : 'bg-white'
//             }`}
//           >
//             <p>Player: {player}</p>
//             <p>Position: {positions[player] || 0}</p>
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={rollDice}
//         classNameName="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Roll Dice
//       </button>
//     </div>
//   );
// };

// export default LudoBoard;

import React from 'react';

const LudoGameBoard = () => {
  return (
    <div className="container card">
      <div className="container-row1 clearfix">
        <div className="row1-col1 green">
          <div className="row1-col1-child clearfix white">
            <div className="green"></div>
            <div className="green"></div>
            <div className="green"></div>
            <div className="green"></div>
          </div>
        </div>
        <div className="row1-col2 clearfix">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className="yellow"></div>
          <div className="yellow"></div>
          <div></div>
          <div className="yellow"></div>
          <div></div>
          <div></div>
          <div className="yellow"></div>
          <div></div>
          <div></div>
          <div className="yellow"></div>
          <div></div>
          <div></div>
          <div className="yellow"></div>
          <div></div>
        </div>
        <div className="row1-col3 yellow">
          <div className="row1-col3-child clearfix white">
            <div className="yellow"></div>
            <div className="yellow"></div>
            <div className="yellow"></div>
            <div className="yellow"></div>
          </div>
        </div>
      </div>

      <div className="container-row2 clearfix">
        <div className="row2-col1 clearfix">
          <div></div>
          <div className="green"></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className="green"></div>
          <div className="green"></div>
          <div className="green"></div>
          <div className="green"></div>
          <div className="green"></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="row2-col2">
          <div className="contain-triangles">
            <div className="triangle-right"></div>
            <div className="triangle-up"></div>
            <div className="triangle-left"></div>
            <div className="triangle-down"></div>
          </div>
        </div>
        <div className="row2-col3 clearfix">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className="blue"></div>
          <div className="blue"></div>
          <div className="blue"></div>
          <div className="blue"></div>
          <div className="blue"></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className="blue"></div>
          <div></div>
        </div>
      </div>

      <div className="container-row3 clearfix">
        <div className="row3-col1 red">
          <div className="row3-col1-child clearfix white">
            <div className="red"></div>
            <div className="red"></div>
            <div className="red"></div>
            <div className="red"></div>
          </div>
        </div>
        <div className="row3-col2 clearfix">
          <div></div>
          <div className="red"></div>
          <div></div>
          <div></div>
          <div className="red"></div>
          <div></div>
          <div></div>
          <div className="red"></div>
          <div></div>
          <div></div>
          <div className="red"></div>
          <div></div>
          <div className="red"></div>
          <div className="red"></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="row3-col3 blue">
          <div className="row3-col3-child clearfix white">
            <div className="blue"></div>
            <div className="blue"></div>
            <div className="blue"></div>
            <div className="blue"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGameBoard;
