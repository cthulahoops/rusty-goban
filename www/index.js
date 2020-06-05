import * as wasm from "wasm-game-of-life";

const CELL_SIZE = 35; // px
const STONE_SIZE = CELL_SIZE * 0.45;

const BOARD_COLOR = "#ddb34e";
const GRID_COLOR = "#333333";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const board_size = 19;

let board = wasm.JsBoard.new(board_size);

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
  drawStone(uncell_transform(e.offsetX), uncell_transform(e.offsetY), board.next_player());
}

const doMouseDown = (e) => {
  const x = uncell_transform(e.offsetX);
  const y = uncell_transform(e.offsetY);
  console.log("Placed at: ", x, y);
  board.play_stone(x, y);
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


const drawHighlight = (x, y) => {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#f00"; 
  ctx.arc(
    cell_transform(x) + 1, 
    cell_transform(y) + 1, 
    STONE_SIZE*0.40,
    0,
    2*Math.PI,
    false);
  ctx.stroke();
  ctx.lineWidth = 1;
}

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
  const x_pos = cell_transform(x) + 1; 
  const y_pos = cell_transform(y) + 1;

  const x_shad = x_pos + STONE_SIZE * 0.2;
  const y_shad = y_pos + STONE_SIZE * 0.2;

  var shadow_gradient = ctx.createRadialGradient(x_shad, y_shad, 0, x_shad, y_shad, 1.1 * STONE_SIZE);
  shadow_gradient.addColorStop(0, "#00000077");
  shadow_gradient.addColorStop(0.7, "#00000066");
  shadow_gradient.addColorStop(1, "#00000000");

  ctx.globalCompositeOperation = "darken";
  ctx.beginPath();
  ctx.arc(x_shad, y_shad, STONE_SIZE * 1.05, 0, 2 * Math.PI, false);
  ctx.fillStyle = shadow_gradient;
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  var stone_gradient = ctx.createRadialGradient(x_pos - STONE_SIZE * 0.3, y_pos - STONE_SIZE * 0.3, STONE_SIZE * 0.1, x_pos, y_pos, 2 * STONE_SIZE);
  if (color == 'black') {
    stone_gradient.addColorStop(0, "#333");
    stone_gradient.addColorStop(1, "#000");
  } else {
    stone_gradient.addColorStop(0, "#fff");
    stone_gradient.addColorStop(1, "#ccc");
  }
  ctx.beginPath();
  ctx.fillStyle = stone_gradient;
  ctx.arc(x_pos, y_pos, STONE_SIZE, 0, 2 * Math.PI, false);
  ctx.fill();
}

const drawBoard = () => {
  drawGrid();
  drawStarPoints();
  board.draw_stones(drawStone);
  var last_move = board.get_last_move();
  if (last_move) {
    drawHighlight(last_move[0], last_move[1]);
  }
}

drawBoard();
