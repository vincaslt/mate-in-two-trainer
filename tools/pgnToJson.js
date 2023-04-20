import * as fs from 'fs';

const data = fs.readFileSync('problems.pgn', 'utf-8');

const problems = []; // { fen, solution }

const blocks = data.split(/^\r?\n$/gm);
for (let i = 0; i < blocks.length; i += 2) {
  const metadata = blocks[i];
  const moves = blocks[i + 1];

  const [fen] = metadata.match(/(?<=\[FEN ").*(?="])/);
  const [, firstMove] = moves.split(' ');

  const solution = firstMove?.trim();

  if (solution && !solution.endsWith('+')) {
    problems.push({
      fen,
      solution,
    });
  }
}

// TODO: include those at some point maybe, but add support in the app
const problemsWithoutPromotionOrCastle = problems.filter(
  ({ solution }) => !solution.includes('=') && !solution.includes('O-O')
);

fs.writeFileSync(
  'problems.json',
  JSON.stringify(problemsWithoutPromotionOrCastle, null, 2)
);
