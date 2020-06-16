import * as wasm from "wasm-game-of-life";

export const board_size = 19;

export const GoBoard = {
  setup: () => ({board: wasm.JsBoard.new(board_size) }),

  turn: {
    moveLimit: 1,
  },

  moves: {
    playAt: (G, ctx, x, y) => {
      // G.board.play_stone(x, y);
      return { board: G.board.play_stone(x, y) };
    }
  }
}
