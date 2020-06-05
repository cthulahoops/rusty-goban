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
    pub size: i32,
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
            size: size,
        }
    }

    pub fn next_player(&self) -> JsValue {
        JsValue::from(self.board.next_player.to_str())
    }

    pub fn play_stone(&mut self, x: i32, y: i32) -> Result<(), JsValue> {
        self.board
            .play_stone(Position { x, y })
            .map_err(JsValue::from)
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
}
