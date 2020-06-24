import io from 'socket.io-client';
// import { Client } from 'boardgame.io/client';
// import { Local, SocketIO } from 'boardgame.io/multiplayer';
import * as wasm from "wasm-game-of-life";
import { GoBoard, board_size } from "./Game";

const CELL_SIZE = 35; // px
const STONE_SIZE = CELL_SIZE * 0.45;

const BOARD_COLOR = "#ddb34e";
const GRID_COLOR = "#333333";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const cell_transform = (cell) => {
  return (cell) * (CELL_SIZE + 1)
};

const uncell_transform = (pos) => {
  return Math.round(pos / (CELL_SIZE + 1))
};

// let board = wasm.JsBoard.new(board_size);

// const canvas = document.getElementById("goban");

// const ctx = canvas.getContext('2d');

const doMouseMove = (e) => {
  drawBoard();
  drawStone(uncell_transform(e.offsetX), uncell_transform(e.offsetY), board.next_player());
}

const drawGrid = (ctx) => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

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


const drawHighlight = (ctx, x, y) => {
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

const drawDot = (ctx, x, y) => {
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

const drawStarPoints = (ctx) => {
  if (board_size === 9) {
    drawDot(ctx, 3, 3);
    drawDot(ctx, 5, 5);
    drawDot(ctx, 7, 7);
    drawDot(ctx, 3, 7);
    drawDot(ctx, 7, 3);
  } else if (board_size === 13) {
    drawDot(ctx, 4, 4);
    drawDot(ctx, 4, 10);
    drawDot(ctx, 10, 4);
    drawDot(ctx, 10, 10);
    drawDot(ctx, 7, 7);
  } else if (board_size === 19) {
    drawDot(ctx, 4, 4);
    drawDot(ctx, 4, 16);
    drawDot(ctx, 16, 4);
    drawDot(ctx, 16, 16);
    drawDot(ctx, 10, 10);
    drawDot(ctx, 10, 4);
    drawDot(ctx, 4, 10);
    drawDot(ctx, 16, 10);
    drawDot(ctx, 10, 16);
  }
};

const drawStone = (ctx, x, y, color) => {
  const x_pos = cell_transform(x) + 1; 
  const y_pos = cell_transform(y) + 1;

  const x_shad = x_pos + STONE_SIZE * 0.2;
  const y_shad = y_pos + STONE_SIZE * 0.2;

  var shadow_gradient = ctx.createRadialGradient(x_shad, y_shad, 0, x_shad, y_shad, 1.1 * STONE_SIZE);
  shadow_gradient.addColorStop(0, "#0033");
  shadow_gradient.addColorStop(0.7, "#0036");
  shadow_gradient.addColorStop(1, "#0030");

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

const drawBoard = (board, canvas) => {
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(ctx);
  drawStarPoints(ctx);
  board.draw_stones((x, y, color) => drawStone(ctx, x, y, color));
  var last_move = board.get_last_move();
  if (last_move) {
    drawHighlight(ctx, last_move[0], last_move[1]);
  }
}


class GoApp {
  constructor(canvas, playerID, socket) {
    this.socket = socket;
    this.game = wasm.JsBoard.new(board_size); 
    this.playerID = playerID;
    this.canvas = canvas;
    this.attachListeners();
    this.update();

    this.socket.on('place_stone', (msg) => { this.placeStone(msg) } );
    this.socket.on('state', (msg) => {
      this.game = wasm.JsBoard.from_js(msg);
      this.update();
    })
  }

  placeStone(msg) {
    console.log("Place stone has been called:", this.playerID, msg);
    if (msg.playerID != this.game.next_player()) {
      console.log("Remote move out of turn - reject.");
      return;
    }
    this.game = this.game.play_stone(msg.x, msg.y);
    console.log("Uetah", this.game, this.game.next_player());
    this.update(this.game)
  }

  attachListeners() {
    // canvas.addEventListener("mousemove", doMouseMove);
    this.canvas.addEventListener("mousedown", (event) => {
      if (this.playerID != this.game.next_player()) {
	console.log("Not your turn: ", this.playerID, this.game.next_player());
	return;
      }
      const x = uncell_transform(event.offsetX);
      const y = uncell_transform(event.offsetY);
      console.log("Placed at: ", x, y);
      this.game = this.game.play_stone(x, y);
      this.socket.emit("place_stone", {
	playerID: this.playerID,
	x: x,
	y: y
      });
      this.update(this.game);
    });
  }

  update() {
    drawBoard(this.game, this.canvas);
  }
}

const playerID = location.hash.substr(1)
  
console.log("We are ", playerID);

let socket = io('http://localhost:3000');
const appElement = document.getElementById('app');

if (appElement !== null) {
    const canvas = document.createElement('canvas');
    appElement.append(canvas);
    canvas.height = cell_transform(board_size + 1);
    canvas.width = cell_transform(board_size + 1);
    new GoApp(canvas, playerID, socket);
}

function create_id() {
  let r = Math.random().toString(36).substring(7);
}

localStorage = window.localStorage; 

let uid = localStorage.getItem('goban-uid');
if (uid === null) {
  uid = create_id() 
  localStorage.setItem('goban-uid', uid)
}

console.log("Location: ", window.location.href);



function create_game(game_id) {
  let li = document.createElement("li");
  li.setAttribute("id", game_id);
  let a = document.createElement("a");
  a.setAttribute("href", game_id);
  a.appendChild(document.createTextNode(game_id));
  li.appendChild(a);
  return li
}


function build_lobby(socket) {
  let button = document.getElementById('create_game_button');
  if (button !== null) {
    button.addEventListener('click', () => {
      let game_id = create_id()
      socket.emit('create_game', {'game_id': game_id});
      socket.on('game_created', () => {window.location.href = '/game/' + game_id});
    });
  }
}
build_lobby(socket)
