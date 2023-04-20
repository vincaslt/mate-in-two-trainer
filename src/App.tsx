import { CSSProperties, useRef, useState } from 'react';
import problemsJSON from './problems.json';
import {
  ChessBoard,
  getAvailableMoves,
  moveToNotation,
  notationToMove,
  parseFEN,
} from './utils/chess';
import { cn } from './utils/classNames';
import { isUpperCase } from './utils/string';

type GameState = {
  chessBoard: ChessBoard;
  turn: 'w' | 'b';
  castleRights: string;
};

function App() {
  const [result, setResult] = useState<'success' | 'fail' | 'surrender'>();
  const [{ fen, solution }, setChessProblem] = useState(getRandomProblem());
  const [gameState, setGameState] = useState<GameState>(parseFEN(fen));

  const { chessBoard, turn } = gameState;

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

  const canMovePiece = (row: number, col: number) => {
    if (result) {
      return;
    }

    const piece = chessBoard[row][col];

    return piece && (isUpperCase(piece) ? turn === 'w' : turn === 'b');
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
          if (!dragState || !square) {
            return undefined;
          }
          setGameState((gameState) => {
            const updatedState = movePiece(gameState, dragState, square);
            if (updatedState !== gameState) {
              setResult(
                moveToNotation(gameState.chessBoard, dragState, square) ===
                  solution
                  ? 'success'
                  : 'fail'
              );
            }
            return updatedState;
          });
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
    return {
      transform: `translate(calc(100% * ${col}), calc(100% * ${row}))`,
      cursor: canMovePiece(row, col) ? 'grab' : undefined,
    };
  };

  const handleClickNext = () => {
    const problem = getRandomProblem();
    setChessProblem(problem);
    setGameState(parseFEN(problem.fen));
    setResult(undefined);
  };

  const handleClickRetry = () => {
    setGameState(parseFEN(fen));
    setResult(undefined);
  };

  const handleClickGiveUp = () => {
    setResult('surrender');
    setGameState(() => {
      const gameState = parseFEN(fen);
      const move = notationToMove(gameState.chessBoard, solution);
      if (move) {
        return movePiece(gameState, move.from, move.to);
      }
      return gameState;
    });
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
                onMouseDown={
                  canMovePiece(rowIdx, colIdx)
                    ? handlePieceDragStart(rowIdx, colIdx)
                    : undefined
                }
              />
            ) : null
          )
        )}
      </div>
      <div className="result-container">
        <div
          className={cn(
            'result',
            result === 'success' && 'result--success',
            result === 'fail' && 'result--fail'
          )}
        >
          {result === 'success' && 'Correct!'}
          {result === 'fail' && 'Incorrect, try again'}
          {result === 'surrender' && `Answer: ${solution}`}
          {!result && (turn === 'w' ? 'White to move' : 'Black to move')}
        </div>
        <div className="controls-container">
          {result !== 'success' && (
            <button className="button" onClick={handleClickGiveUp}>
              ?
            </button>
          )}
          {result === 'fail' && (
            <button className="button" onClick={handleClickRetry}>
              Retry
            </button>
          )}
          <button className="button" onClick={handleClickNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function movePiece(
  gameState: GameState,
  from: { row: number; col: number },
  to: { row: number; col: number }
) {
  const availableMoves = getAvailableMoves(gameState.chessBoard, from);
  const isMoveAvailable = availableMoves.some(
    (move) => move.row === to.row && move.col === to.col
  );

  if (!isMoveAvailable) {
    return gameState;
  }

  // Create a deep copy
  const updatedChessBoard: typeof gameState.chessBoard = JSON.parse(
    JSON.stringify(gameState.chessBoard)
  );

  // Move piece to destination and remove from source
  const piece = gameState.chessBoard[from.row][from.col];
  updatedChessBoard[from.row][from.col] = null;
  updatedChessBoard[to.row][to.col] = piece;

  return {
    ...gameState,
    chessBoard: updatedChessBoard,
    turn: gameState.turn === 'w' ? 'b' : 'w',
  } satisfies GameState;
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
