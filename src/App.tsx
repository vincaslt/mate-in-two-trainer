import { cn } from './utils';
import problemsJSON from './problems.json';
import { CSSProperties, useRef, useState } from 'react';

function App() {
  const [{ fen, solution }, setChessProblem] = useState(getRandomProblem());
  const [{ chessBoard }, setGameState] = useState(parseFEN(fen));

  const squareRefs = useRef<
    {
      el: HTMLDivElement;
      row: number;
      col: number;
    }[]
  >([]);

  const [dragState, setDragState] = useState<{
    row: number;
    col: number;
    initialX: number;
    initialY: number;
    offsetX: number;
    offsetY: number;
  }>();

  const handleClickNext = () => {
    setChessProblem(getRandomProblem());
    setGameState(parseFEN(fen));
  };

  const movePiece = (
    rowFrom: number,
    colFrom: number,
    rowTo: number,
    colTo: number
  ) => {
    setGameState(({ castleRights, chessBoard, turn }) => {
      // Create a deep copy
      const updatedChessBoard: typeof chessBoard = JSON.parse(
        JSON.stringify(chessBoard)
      );

      // Move piece to destination and remove from source
      const piece = chessBoard[rowFrom][colFrom];
      updatedChessBoard[rowFrom][colFrom] = null;
      updatedChessBoard[rowTo][colTo] = piece;

      return {
        castleRights,
        chessBoard: updatedChessBoard,
        turn: turn === 'w' ? 'b' : 'w',
      };
    });
  };

  const handlePieceDragStart =
    (row: number, col: number) => (e: React.MouseEvent<HTMLImageElement>) => {
      const bounds = e.currentTarget.getBoundingClientRect();
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      setDragState({
        row,
        col,
        initialX: centerX,
        initialY: centerY,
        offsetX: e.pageX - centerX,
        offsetY: e.pageY - centerY,
      });

      const handlePieceDrag = (e: MouseEvent) => {
        setDragState(
          (prev) =>
            prev && {
              ...prev,
              offsetX: e.pageX - prev.initialX,
              offsetY: e.pageY - prev.initialY,
            }
        );
      };

      const handlePieceDragEnd = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handlePieceDrag);
        window.removeEventListener('mouseup', handlePieceDragEnd);

        const square = squareRefs.current.find(({ el }) => {
          const squareBounds = el.getBoundingClientRect();
          return (
            e.clientX >= squareBounds.x &&
            e.clientX <= squareBounds.x + squareBounds.width &&
            e.clientY >= squareBounds.y &&
            e.clientY <= squareBounds.y + squareBounds.height
          );
        });

        setDragState((dragState) => {
          if (dragState && square) {
            movePiece(dragState.row, dragState.col, square.row, square.col);
          }
          return undefined;
        });
      };

      window.addEventListener('mousemove', handlePieceDrag);
      window.addEventListener('mouseup', handlePieceDragEnd);
    };

  const getChessPieceStyle = (row: number, col: number): CSSProperties => {
    if (dragState && dragState.row === row && dragState.col === col) {
      return {
        transform: `translate(calc(${col * 100}% + ${
          dragState.offsetX
        }px), calc(${row * 100}% + ${dragState.offsetY}px))`,
        zIndex: 2,
        cursor: 'grabbing',
      };
    }
    return { transform: `translate(calc(100% * ${col}), calc(100% * ${row}))` };
  };

  return (
    <div className="center-container">
      <div className="chessboard">
        {[...Array(64)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) {
                squareRefs.current[i] = {
                  el,
                  row: Math.floor(i / 8),
                  col: i % 8,
                };
              }
            }}
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
                draggable={false}
                style={getChessPieceStyle(rowIdx, colIdx)}
                onMouseDown={handlePieceDragStart(rowIdx, colIdx)}
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
    turn: turn as 'w' | 'b',
    castleRights,
  };
}

function pieceToImage(piece: string) {
  const upperCasePiece = piece.toUpperCase();
  const imageName =
    piece === upperCasePiece ? `w${upperCasePiece}` : `b${upperCasePiece}`;
  return `piece-sets/alpha/${imageName}.svg`;
}

function getRandomProblem() {
  const chessProblems = problemsJSON as { fen: string; solution: string }[];
  const idx = Math.floor(Math.random() * chessProblems.length);
  return chessProblems[idx];
}

export default App;
