// 2. B or W, last play positions
// 3. alternate stone placement
// 4. skip user input
use im::HashMap;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
pub enum Stone {
    Black,
    White,
}

use Stone::*;

#[derive(PartialEq, Hash, Eq, Debug, Clone, Copy, Deserialize, Serialize)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

fn board_serialize<S>(board: &HashMap<Position, Stone>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let vec: Vec<(&Position, &Stone)> = board.into_iter().collect();
    vec.serialize(serializer)
}

fn board_deserialize<'de, D>(deserializer: D) -> Result<HashMap<Position, Stone>, D::Error>
where
    D: Deserializer<'de>,
{
    let vec: Vec<(Position, Stone)> = Deserialize::deserialize(deserializer)?;
    let mut hash = HashMap::new();
    for (k, v) in vec {
        hash.insert(k, v);
    }
    Ok(hash)
}

#[derive(Deserialize, Serialize)]
pub struct Board {
    #[serde(
        serialize_with = "board_serialize",
        deserialize_with = "board_deserialize"
    )]
    pub map: HashMap<Position, Stone>,
    pub size: i32,
    pub next_player: Stone,
    pub last_move: Option<Position>,
    pub last_captures: Vec<Position>,
}

impl Board {
    pub fn new(size: i32) -> Self {
        Board {
            map: HashMap::new(),
            size,
            last_move: None,
            last_captures: vec![],
            next_player: Black,
        }
    }

    pub fn clone(&self) -> Self {
        Self {
            map: self.map.clone(),
            size: self.size,
            last_move: self.last_move,
            last_captures: self.last_captures.clone(),
            next_player: self.next_player,
        }
    }

    fn has_liberties(&self, position: Position) -> bool {
        let player = self.map.get(&position).unwrap();
        let mut visited: HashSet<Position> = HashSet::new();
        let mut queue = vec![position];

        while let Some(next) = queue.pop() {
            for adj_position in self.adjacent(next) {
                if visited.contains(&adj_position) {
                    continue;
                } else {
                    visited.insert(adj_position);
                }
                match self.map.get(&adj_position) {
                    None => {
                        return true;
                    }
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

    fn has_stone(&self, position: Position, stone: Stone) -> bool {
        if let Some(adj_stone) = self.map.get(&position) {
            return *adj_stone == stone;
        }
        false
    }

    fn remove_group(&mut self, position: Position) -> Vec<Position> {
        let mut result = vec![position];
        let origin_stone = self.map.remove(&position).unwrap();
        for adj_position in self.adjacent(position) {
            if self.has_stone(adj_position, origin_stone) {
                let mut captures = self.remove_group(adj_position);
                result.append(&mut captures);
            }
        }
        result
    }

    pub fn play_stone(&mut self, position: Position) -> Result<(), String> {
        let stone = self.next_player;
        // Check for ko!

        if !self.is_on_board(&position) {
            return Err(format!("Play on the board {:?})", position).to_string());
        }

        if self.map.contains_key(&position) {
            return Err("Already occupied.".to_string());
        }

        self.map.insert(position, stone);

        let mut captures = vec![];
        for adj_position in self.adjacent(position) {
            if self.has_stone(adj_position, other_player(stone)) {
                if !self.has_liberties(adj_position) {
                    captures.append(&mut self.remove_group(adj_position));
                }
            } else {
                continue;
            }
        }

        // Ko condition: this move undoes the previous.
        if let Some(last_move) = self.last_move {
            if is_only(&captures, &last_move) && is_only(&self.last_captures, &position) {
                return Err("Move forbidden due to Ko".to_string());
            }
        }

        if !self.has_liberties(position) {
            self.map.remove(&position);
            return Err("Illegal move - no liberties".to_string());
        }

        self.next_player = other_player(self.next_player);
        self.last_captures = captures;
        self.last_move = Some(position);
        Ok(())
    }

    fn is_on_board(&self, pos: &Position) -> bool {
        self.size >= pos.x && pos.x >= 1 && self.size >= pos.y && 1 <= pos.y
    }

    fn adjacent(&self, position: Position) -> Vec<Position> {
        let adj_positions = vec![
            Position {
                x: position.x + 1,
                y: position.y,
            },
            Position {
                x: position.x - 1,
                y: position.y,
            },
            Position {
                x: position.x,
                y: position.y + 1,
            },
            Position {
                x: position.x,
                y: position.y - 1,
            },
        ];
        adj_positions
            .into_iter()
            .filter(|x| self.is_on_board(x))
            .collect()
    }

    pub fn ko_restriction(&self) -> Option<Position> {
        if self.last_captures.len() != 1 {
            return None
        }

        let possible_ko_move = self.last_captures.first().unwrap().clone();

        if self.clone().play_stone(possible_ko_move).is_err() {
            Some(possible_ko_move)
        } else {
            None
        }
    }
}

fn other_player(stone: Stone) -> Stone {
    match stone {
        Black => White,
        White => Black,
    }
}

fn is_only<A>(vec: &Vec<A>, element: &A) -> bool
where
    A: Eq,
{
    vec.len() == 1 && vec.first().unwrap() == element
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ko() {
        let mut board = Board::new(9);
        board.play_stone(Position { x: 1, y: 1 }).unwrap(); // black
        board.play_stone(Position { x: 2, y: 1 }).unwrap(); // white
        board.play_stone(Position { x: 2, y: 2 }).unwrap(); // black
        board.play_stone(Position { x: 1, y: 2 }).unwrap(); // white (captures corner stone)
        board.play_stone(Position { x: 1, y: 3 }).unwrap(); // black
        board.play_stone(Position { x: 8, y: 8 }).unwrap(); // White tenuki
        board.play_stone(Position { x: 1, y: 1 }).unwrap(); // Recapture (1, 2)
        assert!(board.play_stone(Position { x: 1, y: 2 }).is_err()); // Recapture: Forbidden by Ko.
    }
}
