const crypto = require('crypto');

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = crypto.randomBytes(32).toString('hex'); // Generate a 256-bit key
  }

  generateHMAC(move) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(move);
    return hmac.digest('hex');
  }

  playGame() {
    const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];

    console.log(`HMAC: ${this.generateHMAC(computerMove)}`);
    console.log('Available moves:');
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - Exit');
    console.log('? - Help');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter your move: ', (input) => {
      rl.close();
      this.processUserMove(input, computerMove);
    });
  }

  processUserMove(userMove, computerMove) {
    const index = parseInt(userMove);
    if (isNaN(index) || index < 0 || index > this.moves.length) {
      console.log('Invalid move. Please try again.');
      this.playGame();
      return;
    }

    if (index === 0) {
      console.log('Exiting the game.');
      return;
    }

    if (userMove === '?') {
      this.displayHelpTable();
      this.playGame();
      return;
    }

    const userMoveStr = this.moves[index - 1];
    console.log(`Your move: ${userMoveStr}`);
    console.log(`Computer move: ${computerMove}`);

    const result = this.calculateResult(userMoveStr, computerMove);
    if (result === 'win') {
      console.log('You win!');
    } else if (result === 'lose') {
      console.log('You lose!');
    } else {
      console.log('It\'s a draw!');
    }

    console.log(`HMAC key: ${this.key}`);
  }

  calculateResult(userMove, computerMove) {
    const index = this.moves.indexOf(userMove);
    const half = Math.floor(this.moves.length / 2);
    const winningMoves = this.moves.slice(index + 1, index + half + 1);
    const losingMoves = this.moves.slice(index - half, index);
    if (winningMoves.includes(computerMove)) {
      return 'win';
    } else if (losingMoves.includes(computerMove)) {
      return 'lose';
    } else {
      return 'draw';
    }
  }

  displayHelpTable() {
    const table = [];
    const n = this.moves.length;
    for (let i = 0; i <= n; i++) {
      const row = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0 && j === 0) {
          row.push(' ');
        } else if (i === 0) {
          row.push(this.moves[j - 1][0].toUpperCase());
        } else if (j === 0) {
          row.push(this.moves[i - 1][0].toUpperCase());
        } else {
          const result = this.calculateResult(this.moves[i - 1], this.moves[j - 1]);
          if (result === 'win') {
            row.push('Win');
          } else if (result === 'lose') {
            row.push('Lose');
          } else {
            row.push('Draw');
          }
        }
      }
      table.push(row);
    }

    console.log('\nHelp Table:');
    console.log(this.formatTable(table));
  }

  formatTable(table) {
    const columnWidths = [];
    for (let j = 0; j < table[0].length; j++) {
      let maxWidth = 0;
      for (let i = 0; i < table.length; i++) {
        const cellWidth = table[i][j].length;
        if (cellWidth > maxWidth) {
          maxWidth = cellWidth;
        }
      }
      columnWidths.push(maxWidth);
    }

    let formattedTable = '';
    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < table[i].length; j++) {
        const cell = table[i][j];
        const paddedCell = cell.padEnd(columnWidths[j], ' ');
        formattedTable += paddedCell + ' ';
      }
      formattedTable += '\n';
    }

    return formattedTable;
  }
}

// Get command line arguments
const args = process.argv.slice(2);

// Check if the number of arguments is valid
if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
  console.error('Incorrect number of arguments or repeating strings.');
  console.error('Example usage: node game.js rock paper scissors');
  process.exit(1);
}

const moves = args;
const game = new Game(moves);
game.playGame();