// import React from 'react';
// import { useGameStore } from '../stores/gameStore';

// const LudoBoard: React.FC = () => {
//   const { gameId, players, currentTurn, positions, rollDice } = useGameStore();

//   return (
//     <div className="bg-ludo-board p-4 rounded-lg">
//       <div className="mb-4">
//         <h2 className="text-xl font-bold">Game ID: {gameId}</h2>
//         <p>Current Turn: {players[currentTurn]}</p>
//       </div>

//       <div className="grid grid-cols-4 gap-2">
//         {players.map((player, index) => (
//           <div
//             key={player}
//             className={`p-2 rounded ${
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
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Roll Dice
//       </button>
//     </div>
//   );
// };

// export default LudoBoard;
