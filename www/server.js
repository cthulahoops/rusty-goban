const { Game } = require('./Game');

const server = Server({ games: [GoBoard] });

server.run(8000);
