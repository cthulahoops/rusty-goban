var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

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
	socket.broadcast.emit('place_stone', msg);
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
