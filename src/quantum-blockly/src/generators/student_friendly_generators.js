// src/generators/student_friendly_generators.js
import { javascriptGenerator } from 'blockly/javascript';

/**
 * JavaScript Generators for Student-Friendly Blockly Blocks
 * These generators convert student-friendly blocks into valid JavaScript code
 * that creates QUBO models for the quantum server
 */

export function initStudentFriendlyGenerators() {
  // 1. Simple Strategy Generator
  javascriptGenerator.forBlock['simple_strategy'] = function(block) {
    // Get the weight values from the block
    const centerWeight = block.getFieldValue('CENTER_WEIGHT');
    const cornerWeight = block.getFieldValue('CORNER_WEIGHT');
    const edgeWeight = block.getFieldValue('EDGE_WEIGHT');
    
    // Generate the function
    const code = `function createQuboForSingleMove(board) {
  // Initialize variables object for PyQUBO
  const variables = {};
  
  // Create binary variables for empty cells
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      variables['x' + i] = { "type": "Binary" };
    }
  }

  // Set objective function - higher values are preferred positions
  let objectiveTerms = [];
  
  // Add weights based on position
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = ${edgeWeight}; // Default edge weight
      
      if (i === 4) {
        weight = ${centerWeight}; // Center weight
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = ${cornerWeight}; // Corner weight
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
}`;

    return code;
  };

  // 2. Win Detection Strategy Generator
  javascriptGenerator.forBlock['win_detection_strategy'] = function(block) {
    // Get checkbox values
    const findWins = block.getFieldValue('FIND_WINS') === 'TRUE';
    const blockWins = block.getFieldValue('BLOCK_WINS') === 'TRUE';
    const useWeights = block.getFieldValue('USE_WEIGHTS') === 'TRUE';
    
    // Generate function
    const code = `function createQuboForSingleMove(board) {
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
  
  // Check for winning moves
  ${findWins ? `
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
        objectiveTerms.push("20 * x" + emptySpace);
      }
    }
  }` : ''}
  
  // Block opponent's winning moves
  ${blockWins ? `
  // Check each winning line for opponent's potential win
  for (const line of lines) {
    // Count opponent's pieces in this line
    const oppPieces = line.filter(idx => board[idx] === 'O').length;
    
    // If opponent has two pieces and there's an empty space, we should block!
    if (oppPieces === 2) {
      const emptySpace = line.find(idx => board[idx] === '');
      if (emptySpace !== undefined) {
        // This is a blocking move, give it a high weight
        objectiveTerms.push("15 * x" + emptySpace);
      }
    }
  }` : ''}
  
  // Add position-based weights
  ${useWeights ? `
  // Add weights based on position
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = 5; // Default edge weight
      
      if (i === 4) {
        weight = 9; // Center weight
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = 7; // Corner weight
      }
      
      objectiveTerms.push(weight + " * x" + i);
    }
  }` : ''}
  
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
}`;

    return code;
  };

  // 3. Visual Board Generator
  javascriptGenerator.forBlock['visual_board'] = function(block) {
    // Create a representation of the board
    let boardArray = [];
    for (let i = 0; i < 9; i++) {
      const cell = block.getFieldValue('CELL' + i);
      if (cell === 'empty') {
        boardArray.push("''");
      } else {
        boardArray.push(`'${cell}'`);
      }
    }
    
    const code = `[${boardArray.join(', ')}]`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  // 4. Position Weight Generator
  javascriptGenerator.forBlock['position_weight'] = function(block) {
    const position = block.getFieldValue('POSITION');
    const weight = block.getFieldValue('WEIGHT');
    
    const code = `// Position ${position} weight
if (board[${position}] === '') {
  variables['x${position}'] = { "type": "Binary" };
  objectiveTerms.push("${weight} * x${position}");
}`;
    
    return code;
  };

  // 5. Quantum Strategy Builder Generator
  javascriptGenerator.forBlock['quantum_strategy_builder'] = function(block) {
    const positionWeights = javascriptGenerator.statementToCode(block, 'POSITION_WEIGHTS');
    
    const code = `function createQuboForSingleMove(board) {
  // Initialize variables for empty spaces
  const variables = {};
  
  // Create objective terms array
  let objectiveTerms = [];
  
  // Add position weights
${positionWeights}
  
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
}`;

    return code;
  };

  // 6. Beginner Strategy Generator
  javascriptGenerator.forBlock['beginner_strategy'] = function(block) {
    const strategyType = block.getFieldValue('STRATEGY_TYPE');
    
    let strategyCode = '';
    
    if (strategyType === 'center_first') {
      // Center First strategy
      strategyCode = `
  // Position weights - Center has highest weight
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = 5; // Default weight
      
      if (i === 4) {
        // Center has highest weight
        weight = 15;
      } else if ([0, 2, 6, 8].includes(i)) {
        // Corners have medium weight
        weight = 10;
      }
      
      objectiveTerms.push(weight + " * x" + i);
    }
  }`;
    } else if (strategyType === 'corners_first') {
      // Corners First strategy
      strategyCode = `
  // Position weights - Corners have highest weight
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = 5; // Default weight
      
      if ([0, 2, 6, 8].includes(i)) {
        // Corners have highest weight
        weight = 15;
      } else if (i === 4) {
        // Center has medium weight
        weight = 10;
      }
      
      objectiveTerms.push(weight + " * x" + i);
    }
  }`;
    } else {
      // Random strategy
      strategyCode = `
  // All positions have the same weight for a random strategy
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      objectiveTerms.push("10 * x" + i);
    }
  }`;
    }
    
    const code = `function createQuboForSingleMove(board) {
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
  ${strategyCode}
  
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
}`;

    return code;
  };

  // 7. Line Detection Generator
  javascriptGenerator.forBlock['line_detection'] = function(block) {
    const myLineWeight = block.getFieldValue('MY_LINE_WEIGHT');
    const oppLineWeight = block.getFieldValue('OPP_LINE_WEIGHT');
    
    const code = `function createQuboForSingleMove(board) {
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
  
  // Check each line for my pieces and opponent pieces
  for (const line of lines) {
    // Count how many of my pieces are in this line
    const myPieces = line.filter(idx => board[idx] === 'X').length;
    // Count how many of opponent's pieces are in this line
    const oppPieces = line.filter(idx => board[idx] === 'O').length;
    
    // If there are empty cells in this line
    const emptyCells = line.filter(idx => board[idx] === '');
    if (emptyCells.length > 0) {
      // If I have pieces in this line
      if (myPieces > 0 && oppPieces === 0) {
        // For each empty cell, give a weight based on my pieces
        for (const emptyCell of emptyCells) {
          objectiveTerms.push((${myLineWeight} * myPieces) + " * x" + emptyCell);
        }
      }
      
      // If opponent has pieces in this line
      if (oppPieces > 0 && myPieces === 0) {
        // For each empty cell, give a weight based on opponent's pieces
        for (const emptyCell of emptyCells) {
          objectiveTerms.push((${oppLineWeight} * oppPieces) + " * x" + emptyCell);
        }
      }
    }
  }
  
  // Add basic position weights
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = 5; // Default weight
      
      if (i === 4) {
        weight = 8; // Center
      } else if ([0, 2, 6, 8].includes(i)) {
        weight = 6; // Corners
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
}`;

    return code;
  };

  // 8. Complete Strategy Generator
  javascriptGenerator.forBlock['complete_strategy'] = function(block) {
    const findWins = block.getFieldValue('FIND_WINS') === 'TRUE';
    const blockWins = block.getFieldValue('BLOCK_WINS') === 'TRUE';
    const centerWeight = block.getFieldValue('CENTER_WEIGHT');
    const cornerWeight = block.getFieldValue('CORNER_WEIGHT');
    const edgeWeight = block.getFieldValue('EDGE_WEIGHT');
    
    const code = `function createQuboForSingleMove(board) {
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
  
  // Check for winning moves
  ${findWins ? `
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
        objectiveTerms.push("20 * x" + emptySpace);
      }
    }
  }` : ''}
  
  // Block opponent's winning moves
  ${blockWins ? `
  // Check each winning line for opponent's potential win
  for (const line of lines) {
    // Count opponent's pieces in this line
    const oppPieces = line.filter(idx => board[idx] === 'O').length;
    
    // If opponent has two pieces and there's an empty space, we should block!
    if (oppPieces === 2) {
      const emptySpace = line.find(idx => board[idx] === '');
      if (emptySpace !== undefined) {
        // This is a blocking move, give it a high weight
        objectiveTerms.push("15 * x" + emptySpace);
      }
    }
  }` : ''}
  
  // Add weights based on position
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = ${edgeWeight}; // Default edge weight
      
      if (i === 4) {
        weight = ${centerWeight}; // Center weight
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = ${cornerWeight}; // Corner weight
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
}`;

    return code;
  };

  // 9. QUBO Explanation Generator
  javascriptGenerator.forBlock['qubo_explanation'] = function(block) {
    // This is a non-functional explanatory block, so we return an empty string or a comment
    return `// Quantum computers find the best solution by assigning weights
// to each possible move. Higher weights are better moves!
// This is a comment block for educational purposes only.`;
  };
}

export default initStudentFriendlyGenerators;