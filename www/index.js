//import * as wasm from "wasm-game-of-life";

//wasm.greet();
const CELL_SIZE = 35; // px
const BOARD_COLOR = "#bdb38e";
const GRID_COLOR = "#CCCCCC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const width = 19;
const height = 19;

const canvas = document.getElementById("goban");
canvas.height = (CELL_SIZE + 1) * (height+1) + 1;
canvas.width = (CELL_SIZE + 1) * (width+1) + 1;

const ctx = canvas.getContext('2d');

const cell_transform = (cell) => {
  return (cell + 1) * (CELL_SIZE + 1)
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // Vertical lines.
  for (let i = 0; i < width; i++) {
    ctx.moveTo(cell_transform(i) + 1, cell_transform(0));
    ctx.lineTo(cell_transform(i) + 1, cell_transform(height - 1) + 1);
  }

  // Horizontal lines.
  for (let j = 0; j < height; j++) {
    ctx.moveTo(cell_transform(0),           cell_transform(j) + 1);
    ctx.lineTo(cell_transform(width - 1) + 1, cell_transform(j) + 1);
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
const drawBoard = () => {
  if (height === 13) {
    drawDot(3,3);
    drawDot(3,9);
    drawDot(9,3);
    drawDot(9,9);
    drawDot(6,6);
  } else if (height === 19) {
    drawDot(3,3);
    drawDot(3,15);
    drawDot(15,3);
    drawDot(15,15);
    drawDot(9,9);
    drawDot(9,3);
    drawDot(3,9);
    drawDot(15,9);
    drawDot(9,15);
  }
};

const drawStone  = (x, y, color) => {
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

drawGrid();
drawBoard();
drawStone(1,1, BLACK);
drawStone(8,8, BLACK);
drawStone(3,4, WHITE);
