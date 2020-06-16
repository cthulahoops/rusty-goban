var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

import * as wasm from "wasm-game-of-life";

const board_size = 19
var game_state = wasm.JsBoard.new(board_size);

var games = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
	console.log('user disconnected');
    });
    socket.on('place_stone', (msg) => {
	console.log("place_stone:", msg);
	if (msg.playerID == game_state.next_player()) {
	  game_state = game_state.play_stone(msg.x, msg.y);
        }
	socket.broadcast.emit('place_stone', msg);
      console.log(game_state.to_js());
    });

    socket.on('create_game', (msg) => {
      if ( games[msg.game_id] ) {
	console.log("Duplicate game: ", msg.game_id);
	return;
      }
      games[msg.game_id] = wasm.JsBoard.new(msg.board_size);
      io.emit("game_created", { game_id: msg.game_id, board_size: msg.board_size });
    });

    console.log("state", game_state.to_js());
    socket.emit("state", game_state.to_js());

    for (const game_id in games) {
      let game = games[game_id];
      socket.emit("game_created", {
	game_id: game_id,
	board_size: game.get_board_size()
      });
    }
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
