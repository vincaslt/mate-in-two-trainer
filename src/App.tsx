import { cn } from './utils';
import problemsJSON from './problems.json';
import { useState } from 'react';

function App() {
  const [{ fen, solution }, setChessProblem] = useState(getRandomProblem());

  const { chessBoard } = parseFEN(fen);

  const handleClickNext = () => {
    setChessProblem(getRandomProblem());
  };

  return (
    <div className="center-container">
      <div className="chessboard">
        {[...Array(64)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'square',
              i % 2 === Math.floor(i / 8) % 2
                ? 'square--white'
                : 'square--black'
            )}
          />
        ))}
        {chessBoard.map((row, rowIdx) =>
          row.map((piece, colIdx) =>
            piece ? (
              <img
                key={`${rowIdx}_${colIdx}_${piece}`}
                src={pieceToImage(piece)}
                alt={piece}
                className="piece"
                style={{
                  transform: `translate(calc(100% * ${colIdx}), calc(100% * ${rowIdx}))`,
                }}
              />
            ) : null
          )
        )}
      </div>
      <div className="bottom-container">
        <span className="solution">{solution}</span>
        <button className="button-next" onClick={handleClickNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function parseFEN(fen: string) {
  const [board, turn, castleRights] = fen.split(' ');
  const rows = board.split('/');

  let colIdx = 0;
  let rowIdx = 0;
  const chessBoard: (string[] | null[])[] = new Array(8)
    .fill(undefined)
    .map(() => new Array(8).fill(null));

  for (const row of rows) {
    for (const piece of row) {
      const gap = parseInt(piece);
      if (isNaN(gap)) {
        chessBoard[rowIdx][colIdx] = piece;
        colIdx += 1;
      } else {
        colIdx += gap;
      }
    }
    rowIdx += 1;
    colIdx = 0;
  }

  return {
    chessBoard,
    turn,
    castleRights,
  };
}

function pieceToImage(piece: string) {
  const upperCasePiece = piece.toUpperCase();
  const imageName =
    piece === upperCasePiece ? `w${upperCasePiece}` : `b${upperCasePiece}`;
  return `public/piece-sets/alpha/${imageName}.svg`;
}

function getRandomProblem() {
  const chessProblems = problemsJSON as { fen: string; solution: string }[];
  const idx = Math.floor(Math.random() * chessProblems.length);
  return chessProblems[idx];
}

export default App;
