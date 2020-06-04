// 2. B or W, last play positions
// 3. alternate stone placement
// 4. skip user input
use std::collections::HashMap;
use std::collections::HashSet;
use std::io::{stdin,stdout,Write};

use wasm_bindgen::prelude::*;

const GRID_SIZE : i32 = 13;

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

  pub fn get_position(&self) -> Position {
    Position{x: 1, y: 2}
  }
  
  fn has_liberties(&self, position: Position) -> bool {
    let player = self.map.get(&position).unwrap();
    let mut visited : HashSet<Position> = HashSet::new();
    let mut queue = vec![position];
      
    while let Some(next) = queue.pop() {
      for adj_position in adjacent(next) {
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
    for adj_position in adjacent(position) {
      if self.has_stone(adj_position, origin_stone) {
        self.remove_group(adj_position);
      }
    }
  }

  fn play_stone(&mut self, position : Position, stone : Stone) -> Result<(), String> {
      // Check for ko!

      if !is_on_board(&position) {
        return Err("Play on the board".to_string());
      }

      if self.map.contains_key(&position) {
        return Err("Already occupied.".to_string());
      }
      
      self.map.insert(position, stone);
  
      for adj_position in adjacent(position) {
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
      Ok(())
  }

  fn display_board(&self) {
    print!("   ");
    for x in 0..GRID_SIZE {
      print!("{}", x % 10);
    }
    println!("");
    for y in 0..GRID_SIZE {
      print!("{:02} ", y);
      for x in 0..GRID_SIZE {
        let s = match self.map.get(&Position{x: x, y: y}) {
          Some(Stone::Black) => "X",
          Some(Stone::White) => "O",
          None => ".",
        };
        print!("{}", s);
      }
      println!("");
    }
    println!("");
  }
}

fn other_player(stone: Stone) -> Stone {
  match stone {
    Black => White,
    White => Black,
  }
}

fn is_on_board(pos: &Position) -> bool {
  GRID_SIZE > pos.x && pos.x >= 0 && GRID_SIZE > pos.y && 0 <= pos.y
}

fn adjacent ( position : Position) -> Vec<Position> {
  let adj_positions = vec! [
    Position {x: position.x + 1, y: position.y},
    Position {x: position.x - 1, y: position.y},
    Position {x: position.x, y: position.y + 1},
    Position {x: position.x, y: position.y - 1},
  ];
  adj_positions
    .into_iter()
    .filter(is_on_board)
    .collect()
}


fn get_player_input(prompt : &str) -> i32 {
    let mut user_input=String::new();
    print!("{}", prompt);
    let _=stdout().flush();
    stdin().read_line(&mut user_input).expect("Did not enter a correct string");
    if let Some('\n')=user_input.chars().next_back() {
        user_input.pop();
    }
    if let Some('\r')=user_input.chars().next_back() {
        user_input.pop();
    }
    println!("You typed: {}",user_input);
    let my_string = user_input.to_string();  // `parse()` works with `&str` and `String`!
    my_string.parse::<i32>().unwrap()
}

//fn main() {
//  let mut board = Board::new();
//  let mut next_player = Black;
//
//  loop {
//      println!("{:?} to play", next_player);
//      let x = get_player_input("x ");
//      let y = get_player_input("y ");
//      match board.play_stone(Position {x, y}, next_player) {
//        Ok(()) => {
//          board.display_board();
//          next_player = other_player(next_player);
//        }
//        Err(msg) => {
//          println!("Illegal move: {}", msg);
//        }
//      }
//  }
//  println!("{:?}", board);
//  println!("{:?}", has_liberties(&board, Position{x: 2, y: 1}));
//}
