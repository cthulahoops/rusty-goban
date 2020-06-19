mod goban;
mod utils;

use goban::{Board, Position, Stone};
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct JsBoard {
    board: Board,
}

impl Stone {
    pub fn to_str(&self) -> &str {
        match &self {
            Stone::White => "white",
            Stone::Black => "black",
        }
    }
}

// Javascript specific methods for the board.
#[wasm_bindgen]
impl JsBoard {
    pub fn new(size: i32) -> Self {
        set_panic_hook();
        JsBoard {
            board: Board::new(size),
        }
    }

    pub fn get_last_move(&self) -> Vec<i32> {
        match self.board.last_move {
            Some(Position { x, y }) => vec![x, y],
            None => vec![],
        }
    }

    pub fn next_player(&self) -> JsValue {
        JsValue::from(self.board.next_player.to_str())
    }

    pub fn play_stone(&self, x: i32, y: i32) -> Result<JsBoard, JsValue> {
        let mut new_board = self.board.clone();
        match new_board.play_stone(Position { x, y }) {
            Ok(()) => Ok(JsBoard { board: new_board }),
            Err(error) => {
                return Err(JsValue::from(error));
            }
        }
    }

    pub fn pass(&self) {
        let mut board = self.board.clone();
        board.pass()
    }

    pub fn draw_stones(&self, f: &js_sys::Function) -> () {
        for (position, stone) in self.board.map.iter() {
            let this = JsValue::NULL;
            f.call3(
                &this,
                &JsValue::from(position.x),
                &JsValue::from(position.y),
                &JsValue::from(stone.to_str()),
            )
            .unwrap();
        }
    }

    pub fn ko_restriction(&self) -> Vec<i32> {
        match self.board.ko_restriction() {
            Some(Position { x, y }) => vec![x, y],
            None => vec![],
        }
    }

    pub fn to_js(&self) -> JsValue {
        JsValue::from_serde(&self.board).unwrap()
    }

    pub fn from_js(js: &JsValue) -> Self {
        let board: Board = JsValue::into_serde(js).unwrap();
        Self { board }
    }
}
