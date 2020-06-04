// 2. B or W, last play positions
// 3. alternate stone placement
// 4. skip user input
extern crate js_sys;

use std::collections::HashMap;
use std::collections::HashSet;
use std::io::{stdin,stdout,Write};

use wasm_bindgen::prelude::*;


#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Stone {
    Black,
    White,
}

use Stone::*;

#[wasm_bindgen]
#[derive(PartialEq, Hash, Eq, Debug, Clone, Copy)]
pub struct Position {
    x: i32,
    y: i32,
}

#[wasm_bindgen]
pub struct Board {
  map: HashMap<Position, Stone>,
  pub size: i32,
  pub next_player: Stone
}

#[wasm_bindgen]
impl Board {
  pub fn new(size : i32) -> Self {
    Board {
      map: HashMap::new(),
      size,
      next_player: Black,
    }
  }

  fn has_liberties(&self, position: Position) -> bool {
    let player = self.map.get(&position).unwrap();
    let mut visited : HashSet<Position> = HashSet::new();
    let mut queue = vec![position];
      
    while let Some(next) = queue.pop() {
      for adj_position in self.adjacent(next) {
        if visited.contains(&adj_position) {
          continue;
        } else {
          visited.insert(adj_position);
        }
        match self.map.get(&adj_position) {
          None => { return true; }
          Some(adj_player) => {
            if adj_player == player {
              queue.push(adj_position);
            }
          }
        }
      }
    }
    return false;
  }

  fn has_stone(&self, position : Position, stone: Stone) -> bool {
    if let Some(adj_stone) = self.map.get(&position) {
      return *adj_stone == stone 
    }
    false
  }

  fn remove_group(&mut self, position : Position) -> () {
    let origin_stone = self.map.remove(&position).unwrap();
    for adj_position in self.adjacent(position) {
      if self.has_stone(adj_position, origin_stone) {
        self.remove_group(adj_position);
      }
    }
  }

  pub fn next_player_js(&self) -> JsValue {
    let color = match self.next_player {
      White => "#FFFFFF",
      Black => "#000000",
    };
    JsValue::from(color)
  }

  pub fn play_stone_js(&mut self, x : i32, y: i32) -> Result<(), JsValue> {
    self.play_stone(Position { x, y }).map_err(JsValue::from)
  }

  fn play_stone(&mut self, position : Position) -> Result<(), String> {
    let stone = self.next_player;
      // Check for ko!

      if !self.is_on_board(&position) {
        return Err(format!("Play on the board {:?})", position).to_string());
      }

      if self.map.contains_key(&position) {
        return Err("Already occupied.".to_string());
      }
      
      self.map.insert(position, stone);
  
      for adj_position in self.adjacent(position) {
          if self.has_stone(adj_position, other_player(stone)) {
              println!("{:?}", adj_position);
              if !self.has_liberties(adj_position) {
                  self.remove_group(adj_position);
              }
          } else {
              continue
          }
      } 
      if !self.has_liberties(position) {
          self.map.remove(&position);
          return Err("Illegal move - no liberties".to_string());
      }

      self.next_player = other_player(self.next_player);
      Ok(())
  }

  pub fn draw_js_board(&self, f : &js_sys::Function) -> () {
    for (key, val) in self.map.iter() {
      let this = JsValue::NULL;
      let color = match val {
        White => "#FFFFFF",
        Black => "#000000",
      };
      f.call3(
        &this, 
        &JsValue::from(key.x), 
        &JsValue::from(key.y), 
        &JsValue::from(color)).unwrap();
    }
  }

  fn is_on_board(&self, pos: &Position) -> bool {
    self.size >= pos.x && pos.x >= 1 && self.size >= pos.y && 1 <= pos.y
  }

  fn adjacent (&self, position : Position) -> Vec<Position> {
    let adj_positions = vec! [
      Position {x: position.x + 1, y: position.y},
      Position {x: position.x - 1, y: position.y},
      Position {x: position.x, y: position.y + 1},
      Position {x: position.x, y: position.y - 1},
    ];
    adj_positions
      .into_iter()
      .filter(|x| self.is_on_board(x))
      .collect()
  }
}

fn other_player(stone: Stone) -> Stone {
  match stone {
    Black => White,
    White => Black,
  }
}
