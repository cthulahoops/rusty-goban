import * as wasm from "wasm-game-of-life";

const CELL_SIZE = 35; // px
const BOARD_COLOR = "#ddb34e";
const GRID_COLOR = "#333333";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const board_size = 19;

let board = wasm.Board.new(board_size);
console.log(board.size);
console.log(board.get_position());

const cell_transform = (cell) => {
  return (cell) * (CELL_SIZE + 1)
};

const uncell_transform = (pos) => {
  return Math.round(pos / (CELL_SIZE + 1))
};

const canvas = document.getElementById("goban");
canvas.height = cell_transform(board_size + 1);
canvas.width = cell_transform(board_size + 1);

const ctx = canvas.getContext('2d');


const doMouseMove = (e) => {
  drawBoard();
  drawStone(uncell_transform(e.offsetX), uncell_transform(e.offsetY), BLACK + "aa");
}

const doMouseDown = (e) => {
  console.log("Placed at: ", uncell_transform(e.offsetX), uncell_transform(e.offsetY));
}

canvas.addEventListener("mousemove", doMouseMove);
canvas.addEventListener("mousedown", doMouseDown);

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vertical lines.
  for (let i = 1; i <= board_size; i++) {
    ctx.moveTo(cell_transform(i) + 1, cell_transform(1));
    ctx.lineTo(cell_transform(i) + 1, cell_transform(board_size) + 1);
  }

  // Horizontal lines.
  for (let j = 1; j <= board_size; j++) {
    ctx.moveTo(cell_transform(1),         cell_transform(j) + 1);
    ctx.lineTo(cell_transform(board_size) + 1, cell_transform(j) + 1);
  }

  ctx.stroke();
};


const drawDot = (x, y) => {
  ctx.beginPath();
  ctx.fillStyle = GRID_COLOR; 
  ctx.arc(
    cell_transform(x) + 1, 
    cell_transform(y) + 1, 
    CELL_SIZE*0.10,
    0,
    2*Math.PI,
    false);
  ctx.fill();
}

const drawStarPoints = () => {
  if (board_size === 9) {
    drawDot(3,3);
    drawDot(5,5);
    drawDot(7,7);
    drawDot(3,7);
    drawDot(7,3);
  } else if (board_size === 13) {
    drawDot(4,4);
    drawDot(4,10);
    drawDot(10,4);
    drawDot(10,10);
    drawDot(7,7);
  } else if (board_size === 19) {
    drawDot(4,4);
    drawDot(4,16);
    drawDot(16,4);
    drawDot(16,16);
    drawDot(10,10);
    drawDot(10,4);
    drawDot(4,10);
    drawDot(16,10);
    drawDot(10,16);
  }
};

const drawStone = (x, y, color) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(
    cell_transform(x) + 1, 
    cell_transform(y) + 1, 
    CELL_SIZE*0.45,
    0,
    2*Math.PI,
    false);
  ctx.fill();
}

const drawBoard = () => {
  drawGrid();
  drawStarPoints();
  drawStone(3,4, BLACK);
  drawStone(5,3, WHITE);
  drawStone(7,3, BLACK);
  drawStone(5,5, WHITE);
  drawStone(4,6, BLACK);
}

drawBoard();
