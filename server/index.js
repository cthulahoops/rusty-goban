var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

import * as wasm from "wasm-game-of-life";

const board_size = 19
var game_state = wasm.JsBoard.new(board_size);

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

    console.log("state", game_state.to_js());
    socket.emit("state", game_state.to_js());
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
