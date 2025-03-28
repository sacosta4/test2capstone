// src/quantum-blockly/src/examples/studentFriendlyExamples.js

// Collection of example strategies for students
export const studentFriendlyExamples = {
    // Basic strategy that just prefers the center, then corners, then edges
    basicStrategy: {
      name: "Basic Center Strategy",
      description: "A simple strategy that prefers the center, then corners, then edges.",
      blocks: [
        {
          type: "simple_game_function",
          x: 50,
          y: 50,
          fields: {
            CENTER: 9,
            CORNER: 7,
            EDGE: 5
          }
        }
      ],
      code: `function createQuboForSingleMove(board) {
    // Initialize PyQUBO components
    const variables = {};
    const constraints = [];
    
    // Create variables for empty spaces
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        variables['x' + i] = { "type": "Binary" };
      }
    }
    
    // Create objective terms array
    const objectiveTerms = [];
    
    // Add weight terms for each empty position
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        // Assign weight based on position
        let weight = 5; // Default for edges
        
        if (i === 4) {
          weight = 9; // Center position
        } else if (i === 0 || i === 2 || i === 6 || i === 8) {
          weight = 7; // Corner positions
        }
        
        // Add to objective
        objectiveTerms.push(weight + " * x" + i);
      }
    }
    
    // Create the objective function string
    const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
    
    // Add constraint to ensure only one position is selected
    const availableVars = Object.keys(variables).map(v => v);
    if (availableVars.length > 0) {
      constraints.push({
        "lhs": availableVars.join(" + "),
        "comparison": "=",
        "rhs": 1
      });
    }
    
    return {
      "variables": variables,
      "Constraints": constraints,
      "Objective": objective
    };
  }`
    },
    
    // Smart strategy that can detect winning moves and block opponent
    smartStrategy: {
      name: "Smart Win Detection",
      description: "A strategy that can find winning moves and block the opponent.",
      blocks: [
        {
          type: "win_detection_strategy",
          x: 50,
          y: 50,
          fields: {
            FIND_WINS: "TRUE",
            BLOCK_WINS: "TRUE",
            USE_WEIGHTS: "TRUE"
          }
        }
      ],
      code: `function createQuboForSingleMove(board) {
    // Initialize variables object for PyQUBO
    const variables = {};
    
    // Create binary variables for empty cells
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        variables['x' + i] = { "type": "Binary" };
      }
    }
  
    // Set objective function
    let objectiveTerms = [];
    
    // Winning row combinations
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    // Check each winning line
    for (const line of lines) {
      // Count how many of our pieces are in this line
      const myPieces = line.filter(idx => board[idx] === 'X').length;
      
      // If we have two pieces and there's an empty space, we can win!
      if (myPieces === 2) {
        const emptySpace = line.find(idx => board[idx] === '');
        if (emptySpace !== undefined) {
          // This is a winning move, give it a high weight
          objectiveTerms.push("10 * x" + emptySpace);
        }
      }
    }
    
    // Check each winning line for opponent's potential win
    for (const line of lines) {
      // Count opponent's pieces in this line
      const oppPieces = line.filter(idx => board[idx] === 'O').length;
      
      // If opponent has two pieces and there's an empty space, we should block!
      if (oppPieces === 2) {
        const emptySpace = line.find(idx => board[idx] === '');
        if (emptySpace !== undefined) {
          // This is a blocking move, give it a high weight
          objectiveTerms.push("9 * x" + emptySpace);
        }
      }
    }
    
    // Add weights based on position
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        let weight = 5; // Default edge weight
        
        if (i === 4) {
          weight = 7; // Center weight
        } else if (i === 0 || i === 2 || i === 6 || i === 8) {
          weight = 6; // Corner weight
        }
        
        objectiveTerms.push(weight + " * x" + i);
      }
    }
    
    // Ensure we have at least one term in the objective
    const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
    
    // Add constraint to ensure only one move is made
    const constraints = [];
    const availableVars = Object.keys(variables).map(v => v);
    
    if (availableVars.length > 0) {
      constraints.push({
        "lhs": availableVars.join(" + "),
        "comparison": "=",
        "rhs": 1
      });
    }
    
    // Return the QUBO problem
    return {
      "variables": variables,
      "Constraints": constraints,
      "Objective": objective
    };
  }`
    },
    
    // Step-by-step example for a complete strategy
    stepByStepStrategy: {
      name: "Step-by-Step Strategy",
      description: "Learn to build a strategy piece by piece.",
      blocks: [
        {
          type: "student_pyqubo_function",
          x: 50,
          y: 50,
          statements: {
            VARIABLES: [
              {
                type: "position_value",
                fields: {
                  POSITION: "4",
                  WEIGHT: "9"
                }
              },
              {
                type: "position_value",
                fields: {
                  POSITION: "0",
                  WEIGHT: "7"
                }
              },
              {
                type: "position_value",
                fields: {
                  POSITION: "2",
                  WEIGHT: "7"
                }
              }
            ],
            OBJECTIVE: [
              {
                type: "text",
                fields: {
                  TEXT: "These weights help the quantum computer decide where to play!"
                }
              }
            ],
            CONSTRAINTS: [
              {
                type: "text",
                fields: {
                  TEXT: "Make sure we only choose one space"
                }
              }
            ]
          }
        }
      ],
      code: `function createQuboForSingleMove(board) {
    // Step 1: Create variables for empty spaces
    const variables = {};
    
    // Check if position 4 is empty
    if (board[4] === '') {
      variables['x4'] = { "type": "Binary" };
    }
    
    // Check if position 0 is empty
    if (board[0] === '') {
      variables['x0'] = { "type": "Binary" };
    }
    
    // Check if position 2 is empty
    if (board[2] === '') {
      variables['x2'] = { "type": "Binary" };
    }
    
    // Step 2: Set move weights
    let objectiveTerms = [];
    
    // Add weights for positions
    if (board[4] === '') {
      objectiveTerms.push("9 * x4");
    }
    
    if (board[0] === '') {
      objectiveTerms.push("7 * x0");
    }
    
    if (board[2] === '') {
      objectiveTerms.push("7 * x2");
    }
    
    // Create the objective function string
    const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
    
    // Step 3: Add rules (constraints)
    const constraints = [];
    
    // Get all available variables
    const availableVars = Object.keys(variables).map(v => v);
    if (availableVars.length > 0) {
      constraints.push({
        "lhs": availableVars.join(" + "),
        "comparison": "=",
        "rhs": 1
      });
    }
    
    // Return the complete QUBO problem
    return {
      "variables": variables,
      "Constraints": constraints,
      "Objective": objective
    };
  }`
    },
    
    // Corner strategy
    cornerStrategy: {
      name: "Corner Master",
      description: "A strategy that prioritizes taking the corners.",
      blocks: [
        {
          type: "simple_game_function",
          x: 50,
          y: 50,
          fields: {
            CENTER: 7,
            CORNER: 9,
            EDGE: 5
          }
        }
      ],
      code: `function createQuboForSingleMove(board) {
    // Initialize PyQUBO components
    const variables = {};
    const constraints = [];
    
    // Create variables for empty spaces
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        variables['x' + i] = { "type": "Binary" };
      }
    }
    
    // Create objective terms array
    const objectiveTerms = [];
    
    // Add weight terms for each empty position
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        // Assign weight based on position - corners highest!
        let weight = 5; // Default for edges
        
        if (i === 4) {
          weight = 7; // Center position
        } else if (i === 0 || i === 2 || i === 6 || i === 8) {
          weight = 9; // Corner positions - higher than center!
        }
        
        // Add to objective
        objectiveTerms.push(weight + " * x" + i);
      }
    }
    
    // Create the objective function string
    const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
    
    // Add constraint to ensure only one position is selected
    const availableVars = Object.keys(variables).map(v => v);
    if (availableVars.length > 0) {
      constraints.push({
        "lhs": availableVars.join(" + "),
        "comparison": "=",
        "rhs": 1
      });
    }
    
    return {
      "variables": variables,
      "Constraints": constraints,
      "Objective": objective
    };
  }`
    },
    
    // Super-smart strategy combining winning detection with penalties
    superStrategy: {
      name: "Super Quantum Strategy",
      description: "An advanced strategy that combines multiple quantum techniques.",
      blocks: [
        {
          type: "quantum_move_creator",
          x: 50,
          y: 50,
          values: {
            WEIGHTS: {
              type: "win_detection_strategy",
              fields: {
                FIND_WINS: "TRUE",
                BLOCK_WINS: "TRUE",
                USE_WEIGHTS: "TRUE"
              }
            },
            PENALTY: 5
          }
        }
      ],
      code: `function createQuboForSingleMove(board) {
    // Initialize variables object for PyQUBO
    const variables = {};
    
    // Create binary variables for empty cells
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        variables['x' + i] = { "type": "Binary" };
      }
    }
  
    // Set objective function
    let objectiveTerms = [];
    
    // Check for potential winning moves
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Look for wins and blocks
    for (const line of lines) {
      // Count our pieces and empty spaces
      const myPieces = line.filter(idx => board[idx] === 'X').length;
      const emptySpaces = line.filter(idx => board[idx] === '').length;
      
      // If we can win with one more move
      if (myPieces === 2 && emptySpaces === 1) {
        const emptySpace = line.find(idx => board[idx] === '');
        objectiveTerms.push("20 * x" + emptySpace);
      }
      
      // Count opponent's pieces
      const oppPieces = line.filter(idx => board[idx] === 'O').length;
      
      // If we need to block opponent's win
      if (oppPieces === 2 && emptySpaces === 1) {
        const emptySpace = line.find(idx => board[idx] === '');
        objectiveTerms.push("15 * x" + emptySpace);
      }
      
      // Encourage completing lines that we already have one piece in
      if (myPieces === 1 && emptySpaces === 2) {
        const emptySpaces = line.filter(idx => board[idx] === '');
        emptySpaces.forEach(space => {
          objectiveTerms.push("5 * x" + space);
        });
      }
    }
    
    // Add standard position weights
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        let weight = 3; // Edges
        if (i === 4) weight = 8; // Center
        else if ([0, 2, 6, 8].includes(i)) weight = 6; // Corners
        
        objectiveTerms.push(weight + " * x" + i);
      }
    }
    
    // Add penalties for multiple positions
    const penalty = 5;
    const availablePositions = Object.keys(variables).map(v => v.replace('x', '')).map(Number);
    
    // Add quadratic penalty terms to enforce one-hot constraint
    for (let i = 0; i < availablePositions.length; i++) {
      for (let j = i + 1; j < availablePositions.length; j++) {
        objectiveTerms.push("-" + penalty + " * x" + availablePositions[i] + " * x" + availablePositions[j]);
      }
    }
    
    // Create the objective string
    const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
    
    // Add explicit constraint to ensure only one move is made
    const constraints = [];
    const availableVars = Object.keys(variables).map(v => v);
    
    if (availableVars.length > 0) {
      constraints.push({
        "lhs": availableVars.join(" + "),
        "comparison": "=",
        "rhs": 1
      });
    }
    
    // Return the QUBO model
    return {
      "variables": variables,
      "Constraints": constraints,
      "Objective": objective
    };
  }`
    }
  };
  
  // Export the examples
  export default studentFriendlyExamples;