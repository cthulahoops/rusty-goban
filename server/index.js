var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')

import * as wasm from "wasm-game-of-life";

const board_size = 19
var game_state = wasm.JsBoard.new(board_size);

var games = {};


app.use(
  express.static(
    path.join(__dirname, '../www/dist'),
    {index: "index.html"},
  )
);


app.get('/game/[a-z0-9_]+/', (req, res) => { res.sendFile(path.join(__dirname, '../www/dist/game.html')) });


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
	console.log('user disconnected');
    });
    socket.on('place_stone', (msg) => {
      console.log("place_stone:", msg);
      let game_state = games[msg.game_id].board;

      if (msg.player == game_state.next_player()) {
	games[msg.game_id].board = game_state.play_stone(msg.x, msg.y);
	socket.broadcast.emit('place_stone', msg);
      }
      console.log(game_state.to_js());
    });

    socket.on('pass', (msg) => {
      console.log("pass: ", msg);
      let game_state = games[msg.game_id].board;

      if (msg.player == game_state.next_player()) {
	games[msg.game_id].board = game_state.pass();
	socket.broadcast.emit('pass', msg);
      }
      console.log(game_state.to_js());
    })

    socket.on('create_game', (msg) => {
      // Create channel, issue redirect to /game/.../
      if ( games[msg.game_id] ) {
	console.log("Duplicate game: ", msg.game_id);
	return;
      }
      games[msg.game_id] = {
	board: wasm.JsBoard.new(msg.board_size),
	black: "",
	white: ""
      };
      socket.emit("game_created", { game_id: msg.game_id, board_size: msg.board_size });
    });

    socket.on('join_game', (msg) => {
      let game = games[msg.game_id];
      if (!game) {
	console.log("The game does not exist.");
	return;
      }
      let uid = msg.uid;
      let color;

      if (game.black == uid) {
	color = "black";
      } else if (game.white == uid) {
	color = "white";
      } else if (game.black == "") {
	color = "black";
	game.black = uid;
      } else if (game.white == "") {
	color = "white";
	game.white = uid;
      } else {
	color = "spectator";
      }

      console.log("Board size: ", game.board.to_js());
      socket.emit("game_joined", {
	color: color,
	state: game.board.to_js()
      });
    });

//    console.log("state", game_state.to_js());
 //   socket.emit("state", game_state.to_js());

    // for (const game_id in games) {
    //   let game = games[game_id];
    //   socket.emit("game_created", {
	// game_id: game_id,
	// board_size: game.board.get_board_size()
    //   });
    // }
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
