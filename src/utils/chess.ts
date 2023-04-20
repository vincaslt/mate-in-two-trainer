import { isUpperCase } from './string';

export type Piece =
  | 'p'
  | 'k'
  | 'q'
  | 'b'
  | 'n'
  | 'r'
  | 'P'
  | 'K'
  | 'Q'
  | 'B'
  | 'N'
  | 'R';
export type ChessBoard = (Piece[] | null[])[];

export function getAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  switch (chessBoard[from.row][from.col]) {
    case 'B':
    case 'b':
      return getBishopAvailableMoves(chessBoard, from);
    case 'R':
    case 'r':
      return getRookAvailableMoves(chessBoard, from);
    case 'Q':
    case 'q':
      return getQueenAvailableMoves(chessBoard, from);
    case 'K':
    case 'k':
      return getKingAvailableMoves(chessBoard, from);
    case 'N':
    case 'n':
      return getKnightAvailableMoves(chessBoard, from);
    case 'P':
    case 'p':
      return getPawnAvailableMoves(chessBoard, from);
  }
  return [];
}

function getPawnAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  // TODO: pawn promotion
  const piece = chessBoard[from.row][from.col];

  if (!piece) {
    return [];
  }

  const direction = isUpperCase(piece) ? -1 : 1;
  const isStartingRow = isUpperCase(piece) ? from.row === 6 : from.row === 1;

  const forwardMoves = getAvailableMovesInLine(
    chessBoard,
    { row: direction, col: 0 },
    from,
    isStartingRow ? 2 : 1
  ).filter((to) => chessBoard[to.row][to.col] === null);

  const captures = [
    ...getAvailableMovesInLine(
      chessBoard,
      { row: direction, col: -1 },
      from,
      1
    ),
    ...getAvailableMovesInLine(chessBoard, { row: direction, col: 1 }, from, 1),
  ].filter((to) => {
    const destinationPiece = chessBoard[to.row][to.col];
    // only captures
    return (
      destinationPiece !== null &&
      isUpperCase(destinationPiece) !== isUpperCase(piece)
    );
  });

  return [...forwardMoves, ...captures];
}

function getKnightAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  return [
    ...getAvailableMovesInLine(chessBoard, { row: -2, col: -1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: -2, col: 1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: -2 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: 2 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: -2 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: 2 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 2, col: -1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 2, col: 1 }, from, 1),
  ];
}

function getBishopAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  return [
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: -1 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: -1 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: 1 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: 1 }, from),
  ];
}

function getRookAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  return [
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: 0 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: 0, col: 1 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: 0 }, from),
    ...getAvailableMovesInLine(chessBoard, { row: 0, col: -1 }, from),
  ];
}

function getQueenAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  return [
    ...getBishopAvailableMoves(chessBoard, from),
    ...getRookAvailableMoves(chessBoard, from),
  ];
}

function getKingAvailableMoves(
  chessBoard: ChessBoard,
  from: { row: number; col: number }
) {
  // TODO: castling

  return [
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: -1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: -1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: 1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: 1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 1, col: 0 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 0, col: 1 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: -1, col: 0 }, from, 1),
    ...getAvailableMovesInLine(chessBoard, { row: 0, col: -1 }, from, 1),
  ];
}

function getAvailableMovesInLine(
  chessBoard: ChessBoard,
  line: { row: number; col: number },
  from: { row: number; col: number },
  maxDistance: number = Infinity
) {
  const movingPiece = chessBoard[from.row][from.col];
  const available: { row: number; col: number }[] = [];

  if (!movingPiece) {
    return [];
  }

  for (
    let row = from.row + line.row, col = from.col + line.col, distance = 1;
    row >= 0 && row < 8 && col >= 0 && col < 8 && distance <= maxDistance;
    row += line.row, col += line.col, distance += 1
  ) {
    const pieceAtSquare = chessBoard[row][col];

    if (pieceAtSquare !== null) {
      // square occupied by enemy, capture
      if (isUpperCase(pieceAtSquare) !== isUpperCase(movingPiece)) {
        available.push({ row, col });
      }
      break;
    }

    available.push({ row, col });
  }

  return available;
}

export function parseFEN(fen: string) {
  const [board, turn, castleRights] = fen.split(' ');
  const rows = board.split('/');

  let colIdx = 0;
  let rowIdx = 0;
  const chessBoard: ChessBoard = new Array(8)
    .fill(undefined)
    .map(() => new Array(8).fill(null));

  for (const row of rows) {
    for (const piece of row) {
      const gap = parseInt(piece);
      if (isNaN(gap)) {
        chessBoard[rowIdx][colIdx] = piece as Piece;
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

function canMoveTo(
  chessBoard: ChessBoard,
  from: { row: number; col: number },
  to: { row: number; col: number }
) {
  const availableMoves = getAvailableMoves(chessBoard, from);
  return availableMoves.some(
    (availableMove) =>
      availableMove.row === to.row && availableMove.col === to.col
  );
}

function squareToNotation(square: { row: number; col: number }) {
  const file = 'abcdefgh'[square.col];
  const rank = 8 - square.row;
  return `${file}${rank}`;
}

export function moveToNotation(
  chessBoard: ChessBoard,
  from: { row: number; col: number },
  to: { row: number; col: number }
) {
  const piece = chessBoard[from.row][from.col];

  if (!piece) {
    throw new Error('No piece at source location');
  }

  const isPawn = piece === 'p' || piece === 'P';
  const isCapture = !!chessBoard[to.row][to.col];

  const pieceToNotation = () => {
    const fromNotation = squareToNotation(from);

    if (isPawn) {
      return isCapture ? fromNotation[0] : '';
    }

    const pieceSymbol = piece.toUpperCase();

    let ambiguity: { row: number; col: number } | null = null;
    for (let rowIdx = 0; rowIdx < chessBoard.length && !ambiguity; rowIdx++) {
      const row = chessBoard[rowIdx];

      for (let colIdx = 0; colIdx < row.length && !ambiguity; colIdx++) {
        const otherPiece = row[colIdx];
        const otherFrom = { row: rowIdx, col: colIdx };

        const isSamePiece = otherPiece === piece;
        const isDifferentSquare = rowIdx !== from.row || colIdx !== from.col;

        if (
          isSamePiece &&
          isDifferentSquare &&
          canMoveTo(chessBoard, otherFrom, to)
        ) {
          ambiguity = otherFrom;
        }
      }
    }

    if (!ambiguity) {
      return pieceSymbol;
    }

    // 1. Ranks are different
    if (ambiguity.col === from.col) {
      return `${pieceSymbol}${fromNotation[1]}`;
    }

    // 2. Files are different
    return `${pieceSymbol}${fromNotation[0]}`;
  };

  const pieceSymbol = pieceToNotation();
  const captureSymbol = isCapture ? 'x' : '';
  const squareDescriptor = squareToNotation(to);

  const move = `${pieceSymbol}${captureSymbol}${squareDescriptor}`;

  return move;
}

export function notationToMove(chessBoard: ChessBoard, notation: string) {
  for (let rowIdx = 0; rowIdx < chessBoard.length; rowIdx++) {
    const row = chessBoard[rowIdx];

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const piece = row[colIdx];

      if (!piece) {
        continue;
      }

      const from = { row: rowIdx, col: colIdx };
      const availableMoves = getAvailableMoves(chessBoard, from);
      const to = availableMoves.find((to) => {
        return moveToNotation(chessBoard, from, to) === notation;
      });

      if (to) {
        return {
          from,
          to,
        };
      }
    }
  }

  return undefined;
}
