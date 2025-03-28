import { javascriptGenerator } from 'blockly/javascript';
import * as javascript from 'blockly/javascript';
import './javascriptGenerators';  // Ensures JavaScript generator is included
import './blocks/student_friendly_blocks'; // Import student-friendly blocks


javascriptGenerator.scrub_ = function (block, code, thisOnly) {
    // Check if the block is of type 'key_pair' or 'dictionary'
    if (block.type === 'key_pair' || block.type === 'dictionary' || block.type === 'key_block' || block.type === 'value_block') {
        var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        if (nextBlock && !thisOnly) {
            return code + ',\n' + javascriptGenerator.blockToCode(nextBlock);
        }
        return code;
    }
    // For other blocks, apply default scrubbing logic
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var codeNext = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    if (!thisOnly) {
        if (codeNext) {
            codeNext = '\n' + codeNext;
        }
    }
    return code + codeNext;
};

javascriptGenerator.forBlock['key_pair'] = function (block, generator) {
    var key1 = generator.valueToCode(block, 'KEY1', javascript.Order.ATOMIC);
    var key2 = generator.valueToCode(block, 'KEY2', javascript.Order.ATOMIC);
    var code = "`${" + key1 + "},${" + key2 + "}`";
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['for_loop'] = function (block, generator) {
    var variable_var = block.getField('VAR').getText();
    var value_from = generator.valueToCode(block, 'FROM', javascript.Order.ATOMIC) || '0';
    var value_to = generator.valueToCode(block, 'TO', javascript.Order.ATOMIC) || '10';
    var value_step = generator.valueToCode(block, 'STEP', javascript.Order.ATOMIC) || '1';
    var statements_do = generator.statementToCode(block, 'DO');

    // Change the conditional operator from <= to <
    var code = 'for (' + variable_var + ' = ' + value_from + '; ' + variable_var +
        ' < ' + value_to + '; ' + variable_var + ' += ' + value_step + ') {\n' +
        statements_do + '\n}\n';
    return code;
};

javascriptGenerator.forBlock['check_index'] = function (block, generator) {
    var index = generator.valueToCode(block, 'INDEX', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Generate JavaScript code
    var code = 'board[' + index + '] === ' + value;
    return [code, javascript.Order.NONE];
};

javascriptGenerator.forBlock['board_length'] = function (block) {
    var code = 'board.length';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['board'] = function (block) {
    var code = 'board';
    return [code, javascript.Order.ATOMIC];
};

javascript.javascriptGenerator.forBlock['update_dict'] = function (block, generator) {
    var name = block.getField('NAME').getText();
    var key = generator.valueToCode(block, 'KEY', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // TODO: Assemble javascript into code variable.
    var code = name + '[' + key + '] = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['key_block'] = function (block, generator) {
    var key = block.getFieldValue('KEY');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = '"' + key + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['const_block'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = 'const ' + name + ' = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['value_block'] = function (block) {
    var value = block.getFieldValue('VALUE');
    var code = 'board[' + value + ']';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['quad_pair'] = function (block) {
    var var1 = block.getFieldValue('VAR_1');
    var var2 = block.getFieldValue('VAR_2');
    var value = block.getFieldValue('MEMBER_VALUE');
    var name = var1 + ',' + var2;
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['key_value'] = function (block) {
    var name = block.getFieldValue('MEMBER_NAME');
    var value = block.getFieldValue('MEMBER_VALUE');
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = `${name} = {\n${statementMembers}\n} `;
    return code;
};

javascriptGenerator.forBlock['dictionary_block'] = function (block, generator) {
    var code = '{}';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['merge_dict'] = function (block, generator) {
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = '"{\n' + statementMembers + '\n}"';
    return code;
};

javascriptGenerator.forBlock['quad_dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var key1_p1 = block.getFieldValue('KEY1_P1');
    var key1_p2 = block.getFieldValue('KEY1_P2');
    var val1 = block.getFieldValue('VAL1');
    var key2_p1 = block.getFieldValue('KEY2_P1');
    var key2_p2 = block.getFieldValue('KEY2_P2');
    var val2 = block.getFieldValue('VAL2');
    var key3_p1 = block.getFieldValue('KEY3_P1');
    var key3_p2 = block.getFieldValue('KEY3_P2');
    var val3 = block.getFieldValue('VAL3');
    // TODO: Assemble javascript into code variable.
    var code = name + ' = {"' + key1_p1 + ',' + key1_p2 + '": ' + val1 + ', "' + key2_p1 + ',' + key2_p2 + '": ' + val2 + ', "' + key3_p1 + ',' + key3_p2 + '": ' + val3 + '}\n';
    return code;
};

javascriptGenerator.forBlock['update_quad_dict'] = function (block) {
    var name = block.getFieldValue('NAME');
    var key = block.getFieldValue('KEY');
    var key2 = block.getFieldValue('KEY2');
    var val = block.getFieldValue('VALUE');
    // TODO: Assemble javascript into code variable.
    var code = name + '.update({"' + key + ',' + key2 + '": ' + val + '})\n'
    return code;
};

//New functions for qubo_blocks blockly side libraries

// Linear Term Block Generator
javascriptGenerator['linear_term_block'] = function (block) {
    const key = block.getFieldValue('KEY');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascript.ORDER_ATOMIC) || 0;
    return `{ key: "${key}", value: ${value} }`;
  };
  
  // QUBO Main Block Generator
  javascriptGenerator['qubo_main_block'] = function (block) {
    const terms = [];
    for (let i = 1; i <= 9; i++) {
      const key = `x${i}`;
      const weight = javascriptGenerator.valueToCode(block, `WEIGHT${i}`, javascript.ORDER_ATOMIC) || 0;

      terms.push(`${key}: ${weight}`);
    }
    return `const linearTerms = { ${terms.join(', ')} };\n`;
  };
  
  // QUBO Main Block Generator
  javascriptGenerator['qubo_main_block'] = function (block) {
    const terms = [];
    for (let i = 1; i <= 9; i++) {
      const key = `x${i}`;
      const weight = javascriptGenerator.valueToCode(block, `WEIGHT${i}`, javascript.ORDER_ATOMIC) || 0;

      terms.push(`${key}: ${weight}`);
    }
    return `const linearTerms = { ${terms.join(', ')} };\n`;
  };

// New block for PyQUBO variable definition
javascriptGenerator.forBlock['pyqubo_variable'] = function (block, generator) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('NAME');
  
  var code = `variables['${name}'] = { "type": "${type}" };\n`;
  if (type === 'Array') {
      code += `variables['${name}']['size'] = 10;\n`; // Default size
  }
  
  return code;
};

// New block for PyQUBO constraint
javascriptGenerator.forBlock['pyqubo_constraint'] = function (block, generator) {
  var lhs = generator.valueToCode(block, 'LHS', javascript.Order.ATOMIC);
  var operator = block.getFieldValue('OPERATOR');
  var rhs = generator.valueToCode(block, 'RHS', javascript.Order.ATOMIC);
  
  var code = `constraints.push({
      "lhs": "${lhs}",
      "comparison": "${operator}",
      "rhs": ${rhs}
  });\n`;
  
  return code;
};

// New block for PyQUBO objective
javascriptGenerator.forBlock['pyqubo_objective'] = function (block, generator) {
  var expr = generator.valueToCode(block, 'EXPRESSION', javascript.Order.ATOMIC);
  
  var code = `objective = "${expr}";\n`;
  
  return code;
};

// Improved function block generator
javascriptGenerator.forBlock['function'] = function (block, generator) {
  var name = block.getFieldValue('NAME').replace(/\s/g, '_');
  var param = generator.valueToCode(block, 'PARAM', javascript.Order.ATOMIC) || '{}';
  var body = generator.statementToCode(block, 'BODY') || '';
  var linear = generator.valueToCode(block, 'LINEAR', javascript.Order.ATOMIC) || '{}';
  var quadratic = generator.valueToCode(block, 'QUADRATIC', javascript.Order.ATOMIC) || '{}';
  
  // Ensure linear and quadratic are valid objects
  linear = linear.trim() === '' ? '{}' : linear;
  quadratic = quadratic.trim() === '' ? '{}' : quadratic;
  
  var code = `function ${name}(${param}) {\n${body}  return {\n    'linear': ${linear},\n    'quadratic': ${quadratic}\n  };\n}`;
  return code;
};

// Add these generators to your javascriptGenerators.js file

javascriptGenerator.forBlock['init_dictionaries'] = function(block) {
  return 'const linear = {};\nconst quadratic = {};\n';
};

javascriptGenerator.forBlock['set_linear_weight'] = function(block) {
  const variable = javascriptGenerator.valueToCode(block, 'VARIABLE', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `linear[${variable}] = ${weight};\n`;
};

javascriptGenerator.forBlock['set_quadratic_weight'] = function(block) {
  const variable1 = javascriptGenerator.valueToCode(block, 'VARIABLE1', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const variable2 = javascriptGenerator.valueToCode(block, 'VARIABLE2', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `quadratic[\`\${${variable1}},\${${variable2}}\`] = ${weight};\n`;
};

javascriptGenerator.forBlock['return_dictionaries'] = function(block) {
  return 'return { "linear": linear, "quadratic": quadratic };\n';
};

//
// STUDENT-FRIENDLY BLOCK GENERATORS
//

// Generator for Simple Move Strategy Block
javascriptGenerator.forBlock['simple_move_strategy'] = function(block) {
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

  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for Win Detection Strategy Block
javascriptGenerator.forBlock['win_detection_strategy'] = function(block) {
  const findWins = block.getFieldValue('FIND_WINS') === 'TRUE';
  const blockWins = block.getFieldValue('BLOCK_WINS') === 'TRUE';
  const useWeights = block.getFieldValue('USE_WEIGHTS') === 'TRUE';
  
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
        objectiveTerms.push("10 * x" + emptySpace);
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
        objectiveTerms.push("9 * x" + emptySpace);
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
        weight = 7; // Center weight
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = 6; // Corner weight
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

  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for Board Analyzer Block
javascriptGenerator.forBlock['board_analyzer'] = function(block) {
  const findEmpty = block.getFieldValue('FIND_EMPTY') === 'TRUE';
  const findMyPieces = block.getFieldValue('FIND_MY_PIECES') === 'TRUE';
  const findOppPieces = block.getFieldValue('FIND_OPP_PIECES') === 'TRUE';
  
  let code = `function analyzeBoard(board) {
  const result = {
    ${findEmpty ? 'emptySpaces: [],' : ''}
    ${findMyPieces ? 'myPieces: [],' : ''}
    ${findOppPieces ? 'opponentPieces: [],' : ''}
  };
  
  // Analyze the board
  for (let i = 0; i < 9; i++) {
    ${findEmpty ? `
    if (board[i] === '') {
      result.emptySpaces.push(i);
    }` : ''}
    
    ${findMyPieces ? `
    if (board[i] === 'X') {
      result.myPieces.push(i);
    }` : ''}
    
    ${findOppPieces ? `
    if (board[i] === 'O') {
      result.opponentPieces.push(i);
    }` : ''}
  }
  
  return result;
}`;

  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for Quantum Move Creator Block
javascriptGenerator.forBlock['quantum_move_creator'] = function(block) {
  const weights = javascriptGenerator.valueToCode(block, 'WEIGHTS', javascriptGenerator.ORDER_ATOMIC) || '{}';
  const penalty = block.getFieldValue('PENALTY');
  
  const code = `function createQuboForSingleMove(board) {
  // Initialize variables object for PyQUBO
  const variables = {};
  
  // Create binary variables for empty cells
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      variables['x' + i] = { "type": "Binary" };
    }
  }

  // Get weights from the input
  const weights = ${weights};
  
  // Set objective function
  let objectiveTerms = [];
  
  // Add weights for each empty position
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      let weight = 5; // Default weight
      
      // Use provided weights if available
      if (weights && weights[i] !== undefined) {
        weight = weights[i];
      } else if (i === 4) {
        weight = 9; // Center
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = 7; // Corners
      }
      
      objectiveTerms.push(weight + " * x" + i);
    }
  }
  
  // Add penalties for selecting multiple positions
  const penalty = ${penalty};
  const availablePositions = Object.keys(variables).map(v => v.replace('x', '')).map(Number);
  
  // Add quadratic penalty terms for each pair of variables
  for (let i = 0; i < availablePositions.length; i++) {
    for (let j = i + 1; j < availablePositions.length; j++) {
      objectiveTerms.push("-" + penalty + " * x" + availablePositions[i] + " * x" + availablePositions[j]);
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

  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for Simple Game Function Block
javascriptGenerator.forBlock['simple_game_function'] = function(block) {
  const centerWeight = block.getFieldValue('CENTER');
  const cornerWeight = block.getFieldValue('CORNER');
  const edgeWeight = block.getFieldValue('EDGE');
  
  const code = `function createQuboForSingleMove(board) {
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
      let weight = ${edgeWeight}; // Default for edges
      
      if (i === 4) {
        weight = ${centerWeight}; // Center position
      } else if (i === 0 || i === 2 || i === 6 || i === 8) {
        weight = ${cornerWeight}; // Corner positions
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
}`;

  return code;
};

// Generator for Visual Board Block
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

// Generator for QUBO Explanation Block
javascriptGenerator.forBlock['qubo_explanation'] = function(block) {
  // This is just an informational block, it doesn't generate functional code
  const code = `// Quantum Tic-Tac-Toe using QUBO:
// 1. Each empty square gets a weight (higher is better)
// 2. We create a constraint to ensure only one move is made
// 3. The quantum solver finds the position with the highest weight
// 4. This helps find the optimal move on the board`;
  
  return code;
};

// Generator for Student-friendly PyQUBO Function Block
javascriptGenerator.forBlock['Student_pyqubo_function'] = function(block) {
  const variables = javascriptGenerator.statementToCode(block, 'VARIABLES');
  const objective = javascriptGenerator.statementToCode(block, 'OBJECTIVE');
  const constraints = javascriptGenerator.statementToCode(block, 'CONSTRAINTS');
  
  const code = `function createQuboForSingleMove(board) {
  // Step 1: Create variables for empty spaces
  const variables = {};
${variables}
  
  // Step 2: Set move weights
  let objectiveTerms = [];
${objective}
  
  // Create the objective function string
  const objective = objectiveTerms.length > 0 ? objectiveTerms.join(" + ") : "0";
  
  // Step 3: Add rules (constraints)
  const constraints = [];
${constraints}
  
  // Return the complete QUBO problem
  return {
    "variables": variables,
    "Constraints": constraints,
    "Objective": objective
  };
}`;

  return code;
};

// Generator for Position Value Block
javascriptGenerator.forBlock['position_value'] = function(block) {
  const position = block.getFieldValue('POSITION');
  const weight = block.getFieldValue('WEIGHT');
  
  const code = `// Check if position ${position} is empty
if (board[${position}] === '') {
  variables['x${position}'] = { "type": "Binary" };
  objectiveTerms.push("${weight} * x${position}");
}`;
  
  return code;
};