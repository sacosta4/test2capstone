// src/quantum-blockly/src/blocks/student_friendly_blocks.js
import Blockly from 'blockly/core';

/**
 * Student-Friendly Blockly Blocks for Quantum Tic-Tac-Toe
 * These blocks are designed to be more intuitive and educational
 * for K-12 students learning about quantum computing concepts.
 */

export const initStudentFriendlyBlocks = () => {
  // 1. Simple Strategy Block
  // This block creates a basic strategy with configurable weights for center, corners, and edges
  Blockly.Blocks['simple_strategy'] = {
    init: function() {
      this.jsonInit({
        "type": "simple_strategy",
        "message0": "Simple Position Strategy 🎮",
        "message1": "Center weight: %1",
        "args1": [
          {
            "type": "field_number",
            "name": "CENTER_WEIGHT",
            "value": 9,
            "min": 1,
            "precision": 1
          }
        ],
        "message2": "Corner weight: %1",
        "args2": [
          {
            "type": "field_number",
            "name": "CORNER_WEIGHT",
            "value": 7,
            "min": 1,
            "precision": 1
          }
        ],
        "message3": "Edge weight: %1",
        "args3": [
          {
            "type": "field_number",
            "name": "EDGE_WEIGHT",
            "value": 5,
            "min": 1,
            "precision": 1
          }
        ],
        "output": "String",
        "colour": 120,
        "tooltip": "Create a simple strategy based on position weights",
        "helpUrl": ""
      });
    }
  };

  // 2. Win Detection Strategy Block
  // This block creates a strategy that can detect winning moves and block opponent wins
  Blockly.Blocks['win_detection_strategy'] = {
    init: function() {
      this.jsonInit({
        "type": "win_detection_strategy",
        "message0": "Smart Win Detection Strategy 🧠",
        "message1": "Find winning moves: %1",
        "args1": [
          {
            "type": "field_checkbox",
            "name": "FIND_WINS",
            "checked": true
          }
        ],
        "message2": "Block opponent's wins: %1",
        "args2": [
          {
            "type": "field_checkbox",
            "name": "BLOCK_WINS",
            "checked": true
          }
        ],
        "message3": "Use position weights: %1",
        "args3": [
          {
            "type": "field_checkbox",
            "name": "USE_WEIGHTS",
            "checked": true
          }
        ],
        "output": "String",
        "colour": 210,
        "tooltip": "Create a strategy that can find winning moves and block opponent's wins",
        "helpUrl": ""
      });
    }
  };

  // 3. Visual Board Block
  // This block creates a visual representation of a Tic-Tac-Toe board
  Blockly.Blocks['visual_board'] = {
    init: function() {
      this.jsonInit({
        "type": "visual_board",
        "message0": "Board Visualizer 📋",
        "message1": "%1 | %2 | %3",
        "args1": [
          {
            "type": "field_dropdown",
            "name": "CELL0",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL1",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL2",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          }
        ],
        "message2": "───────",
        "message3": "%1 | %2 | %3",
        "args3": [
          {
            "type": "field_dropdown",
            "name": "CELL3",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL4",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL5",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          }
        ],
        "message4": "───────",
        "message5": "%1 | %2 | %3",
        "args5": [
          {
            "type": "field_dropdown",
            "name": "CELL6",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL7",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "CELL8",
            "options": [
              ["Empty", "empty"],
              ["X", "X"],
              ["O", "O"]
            ]
          }
        ],
        "output": "Array",
        "colour": 160,
        "tooltip": "Visualize a Tic-Tac-Toe board",
        "helpUrl": ""
      });
    }
  };

  // 4. Position Weight Block
  // This block assigns a weight to a specific position on the board
  Blockly.Blocks['position_weight'] = {
    init: function() {
      this.jsonInit({
        "type": "position_weight",
        "message0": "Position %1 has weight %2",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "POSITION",
            "options": [
              ["Center (4)", "4"],
              ["Top-Left (0)", "0"],
              ["Top-Middle (1)", "1"],
              ["Top-Right (2)", "2"],
              ["Middle-Left (3)", "3"],
              ["Middle-Right (5)", "5"],
              ["Bottom-Left (6)", "6"],
              ["Bottom-Middle (7)", "7"],
              ["Bottom-Right (8)", "8"]
            ]
          },
          {
            "type": "field_number",
            "name": "WEIGHT",
            "value": 5,
            "min": 1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Assign a weight to a specific position on the board",
        "helpUrl": ""
      });
    }
  };

  // 5. Quantum Strategy Builder Block
  // This block allows students to build a custom quantum strategy
  Blockly.Blocks['quantum_strategy_builder'] = {
    init: function() {
      this.jsonInit({
        "type": "quantum_strategy_builder",
        "message0": "Custom Quantum Strategy 🚀",
        "message1": "Position weights: %1",
        "args1": [
          {
            "type": "input_statement",
            "name": "POSITION_WEIGHTS",
            "check": null
          }
        ],
        "output": "String",
        "colour": 330,
        "tooltip": "Build a custom quantum strategy by assigning weights to positions",
        "helpUrl": ""
      });
    }
  };

  // 6. Beginner Strategy Block
  // This block offers a few preset strategies for beginners
  Blockly.Blocks['beginner_strategy'] = {
    init: function() {
      this.jsonInit({
        "type": "beginner_strategy",
        "message0": "Beginner Strategy: %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "STRATEGY_TYPE",
            "options": [
              ["Center First", "center_first"],
              ["Corners First", "corners_first"],
              ["Random", "random"]
            ]
          }
        ],
        "output": "String",
        "colour": 65,
        "tooltip": "Choose a simple preset strategy",
        "helpUrl": ""
      });
    }
  };

  // 7. Line Detection Strategy Block
  // This block creates a strategy that prioritizes creating and blocking lines
  Blockly.Blocks['line_detection'] = {
    init: function() {
      this.jsonInit({
        "type": "line_detection",
        "message0": "Line Detection Strategy 📏",
        "message1": "My line weight multiplier: %1",
        "args1": [
          {
            "type": "field_number",
            "name": "MY_LINE_WEIGHT",
            "value": 3,
            "min": 1
          }
        ],
        "message2": "Opponent line weight multiplier: %1",
        "args2": [
          {
            "type": "field_number",
            "name": "OPP_LINE_WEIGHT",
            "value": 2,
            "min": 1
          }
        ],
        "output": "String",
        "colour": 180,
        "tooltip": "Create a strategy that prioritizes creating and blocking lines",
        "helpUrl": ""
      });
    }
  };

  // 8. Complete Strategy Block
  // This block combines all the strategies into one advanced block
  Blockly.Blocks['complete_strategy'] = {
    init: function() {
      this.jsonInit({
        "type": "complete_strategy",
        "message0": "Complete Quantum Strategy 🌟",
        "message1": "Find winning moves: %1",
        "args1": [
          {
            "type": "field_checkbox",
            "name": "FIND_WINS",
            "checked": true
          }
        ],
        "message2": "Block opponent's wins: %1",
        "args2": [
          {
            "type": "field_checkbox",
            "name": "BLOCK_WINS",
            "checked": true
          }
        ],
        "message3": "Center weight: %1",
        "args3": [
          {
            "type": "field_number",
            "name": "CENTER_WEIGHT",
            "value": 9,
            "min": 1
          }
        ],
        "message4": "Corner weight: %1",
        "args4": [
          {
            "type": "field_number",
            "name": "CORNER_WEIGHT",
            "value": 7,
            "min": 1
          }
        ],
        "message5": "Edge weight: %1",
        "args5": [
          {
            "type": "field_number",
            "name": "EDGE_WEIGHT",
            "value": 5,
            "min": 1
          }
        ],
        "output": "String",
        "colour": 260,
        "tooltip": "Create a comprehensive strategy with all features",
        "helpUrl": ""
      });
    }
  };

  // 9. QUBO Explanation Block
  // This block provides an educational explanation of QUBO for students
  Blockly.Blocks['qubo_explanation'] = {
    init: function() {
      this.jsonInit({
        "type": "qubo_explanation",
        "message0": "What is QUBO? 🔍",
        "message1": "QUBO stands for Quadratic Unconstrained Binary Optimization",
        "message2": "It's a way to tell quantum computers what problem to solve",
        "message3": "Higher weights = Better positions",
        "colour": 150,
        "tooltip": "Learn about QUBO and how it works",
        "helpUrl": ""
      });
    }
  };
};

// We need to export both the function and a default export
export default initStudentFriendlyBlocks;