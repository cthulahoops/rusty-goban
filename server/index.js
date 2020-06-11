const { GoBoard } = require('./Game');
const Server = require('boardgame.io/server').Server;
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

const server = Server({ 
  enhancer: applyMiddleware(logger),
  games: [GoBoard] });

server.run(8000);
