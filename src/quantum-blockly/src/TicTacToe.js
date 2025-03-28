import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicTacToe = ({ quboCode, log }) => {
  const [gameSetup, setGameSetup] = useState(false);
  const [player1Type, setPlayer1Type] = useState('Human');
  const [player2Type, setPlayer2Type] = useState('CPU');
  const [player1Difficulty, setPlayer1Difficulty] = useState('Easy');
  const [player2Difficulty, setPlayer2Difficulty] = useState('Easy');
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Easy']);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cells, setCells] = useState(Array(9).fill(''));
  const [playerWins, setPlayerWins] = useState({ X: 0, O: 0 });
  const [turnIndicator, setTurnIndicator] = useState('');
  const [gameOver, setGameOver] = useState(false); 
  const [nextGameReady, setNextGameReady] = useState(false); 
  const [gameMode, setGameMode] = useState('Classic'); 
  const [modeSelection, setModeSelection] = useState(true); 
  const [usingFallback, setUsingFallback] = useState(false);
  const [processingMove, setProcessingMove] = useState(false);
  const [fallbackDismissed, setFallbackDismissed] = useState(false);


  const MAX_WINS_DISPLAY = 3; 
  const MOVE_DELAY = 1000; 

  // Default QUBO generator
  const generateDefaultQubo = (currentBoard) => {
    const variables = {};
    const constraints = [];
    let objectiveTerms = [];

    // Create binary variables for each cell
    for (let i = 0; i < 9; i++) {
      // Only create variables for empty cells
      if (!currentBoard || currentBoard[i] === '') {
        variables[`x${i}`] = { type: "Binary" };
        
        // Prioritize center, then corners, then edges using classical Tic-Tac-Toe strategy
        // Using positive values - higher is better
        let weight;
        if (i === 4) { // Center
          weight = 9; // Highest weight for center
        } else if ([0, 2, 6, 8].includes(i)) { // Corners
          weight = 7; // High weight for corners
        } else { // Edges
          weight = 5; // Lower weight for edges
        }
        
        objectiveTerms.push(`(${weight} * x${i})`);
      }
    }
    
    // Default objective if no valid cells
    if (objectiveTerms.length === 0) {
      objectiveTerms = ["0"];
    }
    
    // Build objective expression
    const objective = objectiveTerms.join(" + ");
    
    // Add one-hot constraint: exactly one move should be made
    const availableCells = Object.keys(variables).map(v => v);
    if (availableCells.length > 0) {
      constraints.push({
        lhs: availableCells.join(" + "),
        comparison: "=",
        rhs: 1
      });
    }
    
    console.log('Generated default QUBO with strategy: Center > Corners > Edges');
    
    return {
      variables,
      Constraints: constraints,
      Objective: objective,
      defaultStrategy: {
        description: "Classical Tic-Tac-Toe Strategy",
        priorities: {
          center: 9,
          corners: 7,
          edges: 5
        }
      }
    };
  };

  // Helper function for server communication
  const sendQuboToServer = async (qubo) => {
    try {
      // Deep clone and sanitize the QUBO object
      const sanitizedQubo = JSON.parse(JSON.stringify(qubo));
      
      // Ensure required fields exist
      sanitizedQubo.variables = sanitizedQubo.variables || {};
      sanitizedQubo.Constraints = sanitizedQubo.Constraints || [];
      sanitizedQubo.Objective = sanitizedQubo.Objective || "0";
      
      // Make sure variables is an object, not an array
      if (Array.isArray(sanitizedQubo.variables)) {
        const varsObj = {};
        sanitizedQubo.variables.forEach((v, i) => {
          varsObj[`x${i}`] = { type: "Binary" };
        });
        sanitizedQubo.variables = varsObj;
      }
      
      // Check if variables are empty and provide default variables if needed
      if (Object.keys(sanitizedQubo.variables).length === 0) {
        console.log("Variables are empty, adding default variables");
        for (let i = 0; i < 9; i++) {
          sanitizedQubo.variables[`x${i}`] = { type: "Binary" };
        }
      }
      
      // Ensure all variables have proper type
      Object.keys(sanitizedQubo.variables).forEach(key => {
        if (typeof sanitizedQubo.variables[key] !== 'object') {
          sanitizedQubo.variables[key] = { type: "Binary" };
        }
        if (!sanitizedQubo.variables[key].type) {
          sanitizedQubo.variables[key].type = "Binary";
        }
      });
      
      // Ensure Constraints is an array
      if (!Array.isArray(sanitizedQubo.Constraints)) {
        sanitizedQubo.Constraints = [];
      }
      
      // Ensure Objective is a string
      if (typeof sanitizedQubo.Objective !== 'string') {
        sanitizedQubo.Objective = "0";
      }
      
      // Log what we're sending
      console.log("Sending sanitized QUBO to server");
      
      // Add timeout to prevent hanging
      const response = await axios.post('http://localhost:8000/quantum', sanitizedQubo, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconds timeout
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("Server communication error:", error);
      
      // For error case, create a basic valid QUBO to send again
      try {
        const fallbackQubo = {
          variables: {},
          Constraints: [],
          Objective: "0"
        };
        
        // Add default variables
        for (let i = 0; i < 9; i++) {
          fallbackQubo.variables[`x${i}`] = { type: "Binary" };
        }
        
        // Add a simple constraint
        fallbackQubo.Constraints.push({
          lhs: "x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7 + x8", 
          comparison: "=", 
          rhs: 1
        });
        
        // Set basic objective
        fallbackQubo.Objective = "9 * x4 + 7 * x0 + 7 * x2 + 7 * x6 + 7 * x8 + 5 * x1 + 5 * x3 + 5 * x5 + 5 * x7";
        
        log("> 🔄 Retrying with fallback QUBO structure\n\n");
        
        // Send fallback QUBO
        const fallbackResponse = await axios.post('http://localhost:8000/quantum', fallbackQubo, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        return {
          status: 'success',
          data: fallbackResponse.data
        };
        
      } catch (fallbackError) {
        // If even the fallback fails, return the original error
        let errorDetails = "Unknown error";
        if (error.response) {
          errorDetails = `Server error ${error.response.status}: ${
            error.response.data?.error || JSON.stringify(error.response.data)
          }`;
        } else if (error.request) {
          errorDetails = "Server did not respond. Is the server running?";
        } else {
          errorDetails = error.message;
        }
        
        log(`> ⚠️ Server error: ${errorDetails}\n\n`);
        
        return {
          status: 'error',
          error: errorDetails
        };
      }
    }
  };

  // Fallback move function
  const makeFallbackMove = (availableCells, errorReason) => {
    // Double-check available cells
    if (!availableCells || !Array.isArray(availableCells) || availableCells.length === 0) {
      log(`> ⚠️ No available moves to make. Cannot proceed with fallback.\n\n`);
      return;
    }
  
    log(`> ⚠️ Quantum solver encountered an issue: ${errorReason}\n\n`);
    log(`> 🔄 Switching to classical fallback strategy\n\n`);
    
    // Set fallback indicator
    setUsingFallback(true);
  
    // Try strategic move first if medium/hard CPU is available
    if (currentPlayer === 'X' ? player1Difficulty !== 'Easy' : player2Difficulty !== 'Easy') {
      const strategicMove = findStrategicMove(availableCells, cells, currentPlayer);
      if (strategicMove !== null) {
        makeMove(strategicMove, currentPlayer);
        log(`> 🧠 Using strategic classical move to the ${explainCellMovement(strategicMove)}\n\n`);
        return;
      }
    }
    
    // Try center square if available (good tic-tac-toe strategy)
    const centerIndex = 4;
    if (availableCells.includes(centerIndex)) {
      makeMove(centerIndex, currentPlayer);
      log(`> 🎯 Classical strategy chose the center square (optimal first move)\n\n`);
      return;
    }
    
    // Fall back to a random move
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const fallbackCell = availableCells[randomIndex];
    makeMove(fallbackCell, currentPlayer);
    log(`> 🎲 Classical algorithm selected random move to the ${explainCellMovement(fallbackCell)}\n\n`);
  };

  // Format QUBO data for user-friendly display
  const formatQuboForLog = (quboData, currentBoard) => {
    if (!quboData) {
      return "No QUBO data received from server";
    }
    
    // Log the full response for debugging
    console.log("Full server response:", quboData);
    
    // Check if we have QUBO data
    if (!quboData.qubo || Object.keys(quboData.qubo).length === 0) {
      // Create a minimal response with fallback values
      const fallbackWeights = {};
      for (let i = 0; i < 9; i++) {
        if (!currentBoard || currentBoard[i] === '') {
          if (i === 4) fallbackWeights[i] = 9; // Center
          else if ([0, 2, 6, 8].includes(i)) fallbackWeights[i] = 7; // Corners
          else fallbackWeights[i] = 5; // Edges
        }
      }
      
      // Format the output with fallback information
      let output = "📊 QUBO Analysis:\n\n";
      output += "⚠️ USING FALLBACK STRATEGY ⚠️\n";
      output += "Your quantum algorithm could not be executed as written.\n\n";
      
      // Add board visualization with fallback weights
      output += "🎯 Cell Weights (higher values are better):\n";
      output += "   (Using fallback weights since quantum algorithm didn't provide valid weights)\n";
      
      // Sort from highest to lowest value
      const sortedVars = Object.keys(fallbackWeights)
        .map(cell => ({ cell: parseInt(cell), weight: fallbackWeights[cell] }))
        .sort((a, b) => b.weight - a.weight);
      
      sortedVars.forEach(({ cell, weight }, index) => {
        output += `   Cell ${cell}: ${weight.toFixed(1)}${index === 0 ? " ⭐" : ""}\n`;
      });
      
      // Add visual board representation
      if (currentBoard) {
        output += "\n" + createBoardVisual(fallbackWeights, currentBoard) + "\n";
      }
      
      // Add explanation
      output += "\n🧠 QUBO Strategy Explanation:\n";
      output += "   • The algorithm assigns weights to each empty cell\n";
      output += "   • Higher weight values are preferred (maximization problem)\n";
      output += "   • Interaction terms prevent selecting multiple cells\n";
      output += "   • Problem type: tic tac toe strategy\n";
      
      // Optimal move
      if (sortedVars.length > 0) {
        const bestCell = sortedVars[0].cell;
        const bestWeight = sortedVars[0].weight;
        output += "\n🎲 Optimal Move:\n";
        output += `   → Cell ${bestCell} (${explainCellMovement(bestCell)}) with weight ${bestWeight.toFixed(1)} (fallback strategy)\n`;
      } else {
        output += "\n🎲 No moves available\n";
      }
      
      return output;
    }
    
    // Extract diagonal terms (variable weights)
    const variableWeights = {};
    const interactions = {};
    
    Object.keys(quboData.qubo).forEach(key => {
      if (key.includes("('x") && key.includes("')")) {
        // Parse the variables from the key
        const matches = key.match(/\('x(\d+)'(?:, 'x(\d+)')?\)/);
        if (matches) {
          const var1 = parseInt(matches[1]);
          const var2 = matches[2] ? parseInt(matches[2]) : null;
          
          if (var2 === null) {
            // This is a diagonal term (single variable)
            // Convert negative weights to positive by taking absolute value
            variableWeights[var1] = Math.abs(quboData.qubo[key]);
          } else {
            // This is an interaction term
            if (!interactions[var1]) interactions[var1] = {};
            interactions[var1][var2] = quboData.qubo[key];
          }
        }
      }
    });
    
    // Check if we're using a fallback
    const usingFallback = quboData.explanation && quboData.explanation.using_fallback === true;
    
    // Format the output
    let output = "📊 QUBO Analysis:\n";
    
    // If server provided explanations, use them
    if (quboData.explanation) {
      // Add a prominent fallback notice if applicable
      if (usingFallback) {
        output += "\n⚠️ USING FALLBACK STRATEGY ⚠️\n";
        output += "Your quantum algorithm could not be executed as written.\n";
      }
      
      if (quboData.explanation.method) {
        output += `\n🔬 Method: ${quboData.explanation.method === "quantum_annealing" ? 
                  "Quantum Annealing" : "Classical Fallback"}\n`;
      }
      
      if (quboData.explanation.highlights && quboData.explanation.highlights.length > 0) {
        output += "\n💡 Insights:\n";
        quboData.explanation.highlights.forEach(highlight => {
          output += `   • ${highlight}\n`;
        });
      }
    }
    
    // Only include available cells that are empty on the board
    const availableCellWeights = {};
    Object.keys(variableWeights).forEach(cell => {
      const cellIdx = parseInt(cell);
      // Check if the cell is valid and empty on the board
      if (!isNaN(cellIdx) && cellIdx >= 0 && cellIdx < 9 && 
          (!currentBoard || currentBoard[cellIdx] === '')) {
        availableCellWeights[cellIdx] = variableWeights[cellIdx];
      }
    });
    
    // Variable weights section
    output += "\n🎯 Cell Weights (higher values are better):\n";
    
    // If we have no weights but we know there are empty cells, create fallback weights
    if (Object.keys(availableCellWeights).length === 0 && currentBoard) {
      // Generate fallback weights for display purposes
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
          if (i === 4) availableCellWeights[i] = 9; // Center
          else if ([0, 2, 6, 8].includes(i)) availableCellWeights[i] = 7; // Corners
          else availableCellWeights[i] = 5; // Edges
        }
      }
      
      if (usingFallback) {
        output += "   (Using fallback weights since quantum algorithm didn't provide valid weights)\n";
      }
    }
    
    // Sort from highest to lowest value
    const sortedVars = Object.keys(availableCellWeights)
      .map(cell => ({ cell: parseInt(cell), weight: availableCellWeights[cell] }))
      .sort((a, b) => b.weight - a.weight); // Sort from highest to lowest
    
    sortedVars.forEach(({ cell, weight }, index) => {
      // Add star to highest value (best) option
      output += `   Cell ${cell}: ${weight.toFixed(1)}${index === 0 ? " ⭐" : ""}\n`;
    });
    
    // Add visual board representation if we have a current board
    if (currentBoard) {
      output += "\n" + createBoardVisual(availableCellWeights, currentBoard) + "\n";
    }
    
    // Summarize the QUBO logic
    output += "\n🧠 QUBO Strategy Explanation:\n";
    output += "   • The algorithm assigns weights to each empty cell\n";
    output += "   • Higher weight values are preferred (maximization problem)\n";
    output += "   • Interaction terms prevent selecting multiple cells\n";
    
    if (quboData.explanation && quboData.explanation.problem_type) {
      output += `   • Problem type: ${quboData.explanation.problem_type.replace(/_/g, " ")}\n`;
    }
    
    output += "\n🎲 Optimal Move:\n";
    if (sortedVars.length > 0) {
      // Get the cell with the highest weight (first in sorted array)
      const bestCell = sortedVars[0].cell;
      const bestWeight = sortedVars[0].weight;
      
      output += `   → Cell ${bestCell} (${explainCellMovement(bestCell)}) with weight ${bestWeight.toFixed(1)}`;
      
      // Indicate if this is a fallback recommendation
      if (usingFallback) {
        output += " (fallback strategy)";
      }
      
      output += "\n";
    } else {
      output += "   → No optimal move found\n";
    }
    
    return output;
  };

  // Main function to fetch quantum move
  const fetchQuantumMove = async () => {
    // If already processing a move or game is over, exit early
    if (processingMove || gameOver || nextGameReady) {
      console.log("Quantum move prevented - game state doesn't allow moves", {
        processingMove, gameOver, nextGameReady
      });
      return;
    }
    
    let availableCells = [];
  
    try {
      // Define available cells first - we'll need this regardless of outcome
      availableCells = cells
        .map((cell, index) => (cell === '' ? index : null))
        .filter((index) => index !== null);
  
      if (availableCells.length === 0) {
        log('> No available moves to make\n\n');
        return;
      }
  
      // Basic validation of QUBO code
      if (!quboCode || typeof quboCode !== "string" || quboCode.trim() === '') {
        throw new Error("Invalid QUBO code received.");
      }
  
      // Check if code contains the required function
      if (!quboCode.includes('createQuboForSingleMove')) {
        throw new Error("QUBO code doesn't contain createQuboForSingleMove function.");
      }
  
      try {
        // More robust function evaluation
        const functionBody = `
          try {
            ${quboCode}
            return typeof createQuboForSingleMove === 'function' ? createQuboForSingleMove : null;
          } catch (err) {
            console.error("Function evaluation error:", err);
            return null;
          }
        `;
        
        // Create function in a safer way
        const functionCreator = new Function('board', functionBody);
        const createQuboForSingleMove = functionCreator(cells);
  
        if (typeof createQuboForSingleMove !== 'function') {
          throw new Error("Failed to extract createQuboForSingleMove function");
        }
  
        // Get QUBO data (either from user function or default)
        let qubo;
        try {
          if (typeof createQuboForSingleMove === 'function') {
            qubo = createQuboForSingleMove(cells);
            log('> 🧩 Generated quantum problem from your Blockly code\n\n');
          } else {
            throw new Error("createQuboForSingleMove is not a function");
          }
        } catch (quboError) {
          console.error("Error getting QUBO data:", quboError);
          log(`> ⚠️ Error in QUBO generation: ${quboError.message}\n\n`);
          qubo = generateDefaultQubo(cells);
          log(`> 🔄 Using default QUBO model as fallback\n\n`);
          setUsingFallback(true); // Set fallback indicator
        }
  
        // Validate QUBO output
        if (!qubo || typeof qubo !== 'object') {
          log("> ⚠️ Invalid QUBO structure, using default generator\n\n");
          qubo = generateDefaultQubo(cells);
          setUsingFallback(true); // Set fallback indicator
        }
  
        // Send QUBO to server
        log("> 📡 Sending quantum problem to solver\n\n");
        const serverResult = await sendQuboToServer(qubo);
        
        // More robust error handling
        if (!serverResult || serverResult.status === 'error') {
          const errorMsg = serverResult?.error || "Unknown server error";
          log(`> ⚠️ Server error: ${errorMsg}\n\n`);
          throw new Error(errorMsg);
        }
  
        const responseData = serverResult.data || {};
        console.log("Full server response:", responseData);
  
        // Always check for empty response
        if (!responseData || !responseData.qubo || Object.keys(responseData.qubo).length === 0) {
          log("> ⚠️ Empty response from server, using fallback\n\n");
          setUsingFallback(true);
          
          // Create fallback QUBO data
          const fallbackQubo = generateDefaultQubo(cells);
          
          // Use the fallback data instead
          responseData.qubo = {
            "('x0', 'x0')": 7,  // corner
            "('x1', 'x1')": 5,  // edge
            "('x2', 'x2')": 7,  // corner
            "('x3', 'x3')": 5,  // edge
            "('x4', 'x4')": 9,  // center
            "('x5', 'x5')": 5,  // edge
            "('x6', 'x6')": 7,  // corner
            "('x7', 'x7')": 5,  // edge
            "('x8', 'x8')": 7   // corner
          };
          responseData.explanation = {
            "highlights": ["Using fallback QUBO due to empty server response"],
            "method": "classical_fallback",
            "using_fallback": true
          };
        }
        
        // Check if server is using fallback
        if (responseData.explanation && responseData.explanation.using_fallback === true) {
          setUsingFallback(true); // Set fallback indicator
        }
        
        // Display the formatted QUBO data for educational purposes
        log(`> 🔬 Received quantum solution\n\n`);
        log(formatQuboForLog(responseData, cells) + "\n\n");
  
        // Extract cell weights from response
        const cellWeights = {};
  
        // First try the standard format
        if (Object.keys(responseData.qubo || {}).length > 0) {
          Object.keys(responseData.qubo).forEach((key) => {
            if (key.includes("('x") && key.includes("')")) {
              try {
                // More robust parsing
                const match = key.match(/\('x(\d+)'/);
                if (match && match[1]) {
                  const cellIdx = parseInt(match[1]);
                  if (!isNaN(cellIdx) && availableCells.includes(cellIdx)) {
                    // Store absolute value of weight (convert negative to positive)
                    cellWeights[cellIdx] = Math.abs(responseData.qubo[key]);
                  }
                }
              } catch (parseError) {
                console.error("Error parsing cell index:", parseError);
              }
            }
          });
        }
  
        // If no weights were extracted, try an alternative format or use fallback
        if (Object.keys(cellWeights).length === 0) {
          // Try alternative parsing if the server sends a different format
          console.log("No weights extracted, server data format:", responseData);
          
          // Use fallback weights
          log("> ⚠️ No valid cell weights found, using fallback weights\n\n");
          availableCells.forEach(cellIdx => {
            if (cellIdx === 4) cellWeights[cellIdx] = 9; // Center
            else if ([0, 2, 6, 8].includes(cellIdx)) cellWeights[cellIdx] = 7; // Corners
            else cellWeights[cellIdx] = 5; // Edges
          });
          setUsingFallback(true); // Set fallback indicator
        }
  
        log(`> 🔍 Analyzed ${Object.keys(cellWeights).length} possible moves\n\n`);
  
        // Find the best move (highest weight)
        let bestCell = availableCells[0];
        let bestWeight = -Infinity;
  
        Object.keys(cellWeights).forEach((cellIdx) => {
          const weight = cellWeights[cellIdx];
          if (weight > bestWeight) {
            bestWeight = weight;
            bestCell = parseInt(cellIdx);
          }
        });
  
        // Check if we're using fallback
        const usingServerFallback = responseData.explanation && responseData.explanation.using_fallback === true;
        
        // Make the chosen move
        makeMove(bestCell, currentPlayer);
        
        if (usingServerFallback || usingFallback) {
          log(`> 🎮 Classical fallback algorithm selected the ${explainCellMovement(bestCell)}\n\n`);
        } else {
          log(`> 🎮 Quantum algorithm selected the ${explainCellMovement(bestCell)}\n\n`);
        }
  
      } catch (syntaxError) {
        console.error("Function generation error:", syntaxError);
        log(`> ⚠️ Error generating QUBO function: ${syntaxError.message}\n\n`);
        throw syntaxError;
      }
  
    } catch (error) {
      console.error("Quantum Move Error:", error);
      log(`> ⚠️ Quantum Move Error: ${error.message}\n\n`);
  
      // Make a fallback move
      makeFallbackMove(availableCells, error.message);
    }
  };

  const explainCellMovement = (cell) => {
    const positions = {
    0: "top-left corner",
    1: "top-center edge", 
    2: "top-right corner",
    3: "middle-left edge",
    4: "center",
    5: "middle-right edge",
    6: "bottom-left corner",
    7: "bottom-center edge",
    8: "bottom-right corner"
    };
  
  return positions[cell] || `cell ${cell}`;
  };

  // Create a visual board representation with weights
  const createBoardVisual = (weights, board) => {
  let visual = "   Board Weights:\n";
  visual += "   ┌───┬───┬───┐\n";
  
  for (let row = 0; row < 3; row++) {
    visual += "   │";
    for (let col = 0; col < 3; col++) {
      const cellIdx = row * 3 + col;
      const cellContent = board[cellIdx];
      
      if (cellContent) {
        // Cell is already occupied
        visual += ` ${cellContent} │`;
      } else if (weights[cellIdx] !== undefined) {
        // Show weight (simplified)
        const weightStr = Math.abs(weights[cellIdx]).toFixed(0);
        // Ensure we have proper padding
        visual += weightStr.length === 1 ? ` ${weightStr} │` : `${weightStr} │`;
      } else {
        // Empty cell
        visual += "   │";
      }
    }
    visual += "\n";
    
    if (row < 2) {
      visual += "   ├───┼───┼───┤\n";
    } else {
      visual += "   └───┴───┴───┘\n";
    }
  }
  
  return visual;
  };

  const handleCPUMove = (difficulty) => {
    // If game is over or processing, exit early
    if (processingMove || gameOver || nextGameReady) {
      console.log("CPU move prevented - game state doesn't allow moves", {
        processingMove, gameOver, nextGameReady
      });
      return;
    }
    
    const availableCells = cells
      .map((cell, index) => (cell === '' ? index : null))
      .filter((index) => index !== null);
  
    if (availableCells.length === 0) {
      console.log("No available cells for CPU move");
      return;
    }
    
    log(`> Available cells for CPU: ${availableCells.join(',')}\n`);
    let chosenCell = null;
  
    if (difficulty === 'Easy') {
      // Easy: Random move
      chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      log(`> CPU (Easy) chose cell: ${chosenCell}\n`);
    } else if (difficulty === 'Medium') {
      // Medium: Check for winning or blocking moves first
      chosenCell = findStrategicMove(availableCells, cells, currentPlayer);
      if (chosenCell === null) {
        chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        log(`> CPU (Medium) chose random move: ${chosenCell}\n`);
      }
    } else if (difficulty === 'Hard') {
      // Hard: Minimax algorithm for optimal move
      chosenCell = getBestMove(cells, currentPlayer);
      log(`> CPU (Hard) chose cell: ${chosenCell}\n`);
    }
  
    makeMove(chosenCell);
  };
  
  useEffect(() => {
    if (gameSetup && !gameOver && !nextGameReady) {
      // Prevent executing move logic if the game is already processing a move
      if (processingMove) return;
      
      // Additional check to make sure there are valid moves
      const availableCells = cells.filter(cell => cell === '').length;
      if (availableCells === 0) return;
      
      if (currentPlayer === 'X' && player1Type === 'CPU') {
        setTurnIndicator('Player 1 (CPU) is making a move...');
        setProcessingMove(true); // Add a processing flag
        setTimeout(() => {
          handleCPUMove(player1Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'CPU') {
        setTurnIndicator('Player 2 (CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          handleCPUMove(player2Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'Quantum CPU') { 
        setTurnIndicator('Player 2 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'X' && player1Type === 'Quantum CPU') {
        setTurnIndicator('Player 1 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else {
        setTurnIndicator(
          `It's ${currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s turn`
        );
      }
    }
  }, [currentPlayer, gameSetup, gameOver, processingMove, nextGameReady, cells, 
    fetchQuantumMove, handleCPUMove, player1Difficulty, player1Type, 
    player2Difficulty, player2Type]);

  // Function to handle starting the game after setup
  const startGame = () => {
    setGameSetup(true);
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setTurnIndicator("It's Player 1's turn");
    setGameOver(false);
    setNextGameReady(false);
    setUsingFallback(false);
    setFallbackDismissed(false); // Reset when starting a new game
    setProcessingMove(false);
    log(`> ${gameMode} Mode started\n\n`);
  };

  // Function to handle mode selection
  const handleModeSelection = (mode) => {
    setGameMode(mode);
    setModeSelection(false); // Move to setup screen
    log(`> ${mode} Mode selected\n\n`);
  };


  const handleCellClick = (index) => {
    // Strict check of game state before allowing moves
    if (cells[index] !== '' || !gameSetup || gameOver || processingMove || nextGameReady) {
      return;
    }
  
    if ((currentPlayer === 'X' && player1Type === 'Human') ||
        (currentPlayer === 'O' && player2Type === 'Human')) {
      makeMove(index);
    }
  };

  const makeMove = (index, player = currentPlayer) => {
    // More strict checking to prevent unwanted moves
    if (processingMove || gameOver || nextGameReady || cells[index] !== '') {
      console.log("Move prevented: game state doesn't allow moves", { 
        processingMove, gameOver, nextGameReady, cellOccupied: cells[index] !== '' 
      });
      return;
    }
    
    const newCells = [...cells];
    newCells[index] = player;
    setCells(newCells);
    log(`> Placed ${player} at cell ${index}\n\n`);
  
    // Save game state first
    saveGame({ cells: newCells, currentPlayer: player === 'X' ? 'O' : 'X' });
  
    // Check for win or draw immediately
    if (checkWinner(newCells, player)) {
      // Call handleWin which handles all game over logic
      handleWin(player);
      return;
    } else if (checkDraw(newCells)) {
      setGameOver(true);
      log("> Game ended in a draw\n\n");
      setTimeout(() => {
        alert("It's a draw!");
        prepareNextGame();
      }, 100);
      return;
    }
  
    // Only change player if the game continues
    setCurrentPlayer(player === 'X' ? 'O' : 'X');
  };
  
  // Modify startNextGame to be more atomic
  const startNextGame = () => {
    // Create a completely fresh board first
    const emptyBoard = Array(9).fill('');
    setCells(emptyBoard);
    
    // Use a single timeout to delay all the remaining state changes
    setTimeout(() => {
      // Apply all these changes together
      setCurrentPlayer('X');
      setTurnIndicator("It's Player 1's turn");
      setNextGameReady(false);
      setUsingFallback(false);
      
      // Add one final delay before releasing game locks
      setTimeout(() => {
        // CRITICAL: Only release these at the very end, and with enough delay
        setProcessingMove(false);
        setGameOver(false);
        log(`> New game started\n\n`);
      }, 100);
    }, 150);
  };

  const handleWin = (player) => {
    // CRITICAL: Check if we're already processing a win to prevent double counting
    // This is the key addition that prevents duplicate win processing
    if (processingMove || gameOver) {
      console.log("Win already being processed, ignoring duplicate win detection");
      return;
    }
    
    // IMMEDIATELY lock ALL game state 
    setGameOver(true);
    setProcessingMove(true);
    
    // Make a local copy of wins that we'll work with
    const currentWins = {...playerWins};
    currentWins[player] += 1;
    
    // Log for debugging
    console.log(`Player ${player} wins. Current wins:`, currentWins);
    
    // Set win state BEFORE showing any alerts
    setPlayerWins(currentWins);
    
    // Use a longer timeout to make sure state is fully updated
    setTimeout(() => {
      // First alert the win
      alert(`${player} wins!`);
      
      // Then check if series is won based on our local variable (not state)
      if (currentWins[player] >= MAX_WINS_TO_WIN_SERIES) {
        // Freeze the entire UI completely
        document.body.style.pointerEvents = 'none';
        
        setTimeout(() => {
          alert(`Player ${player} has won the best-of-${MAX_WINS_DISPLAY} series!`);
          
          // Determine unlocks - code similar to before
          let shouldUnlockMedium = false;
          let shouldUnlockHard = false;
          
          // Medium unlock check
          if ((player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
              (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Easy') ||
              (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
              (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Easy')) {
            shouldUnlockMedium = !unlockedDifficulties.includes('Medium');
          }
          
          // Hard unlock check
          if ((player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
              (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Medium') ||
              (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
              (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Medium')) {
            shouldUnlockHard = !unlockedDifficulties.includes('Hard');
          }
          
          // Process unlocks in sequence with separate state updates
          if (shouldUnlockMedium) {
            setUnlockedDifficulties(prev => {
              if (prev.includes('Medium')) return prev;
              alert('Congratulations! "Medium" difficulty unlocked!');
              return [...prev, 'Medium']; 
            });
          } else if (shouldUnlockHard) {
            setUnlockedDifficulties(prev => {
              if (prev.includes('Hard')) return prev;
              alert('Congratulations! "Hard" difficulty unlocked!');
              return [...prev, 'Hard'];
            });
          }
          
          // Wait for UI updates then SYNCHRONOUSLY reset everything
          setTimeout(() => {
            // Clear all state in one atomic operation
            setCells(Array(9).fill(''));
            setCurrentPlayer('X');
            setPlayerWins({ X: 0, O: 0 });
            setGameSetup(false);
            setTurnIndicator('');
            setGameOver(false);
            setNextGameReady(false);
            setProcessingMove(false);
            setUsingFallback(false);
            setFallbackDismissed(false);
            
            // Re-enable UI
            document.body.style.pointerEvents = '';
            
            log('> Reset to setup after series completion\n\n');
          }, 300);
        }, 200);
      } else {
        // Series not over - just prepare for next game
        setNextGameReady(true);
        log("> Game complete. Ready for next round\n\n");
      }
    }, 250);
  };

  

  const prepareNextGame = () => {
    setNextGameReady(true);
    // Don't set gameOver to false yet - keep it true until user starts next game
    log("> Game complete. Ready for next round\n\n");
  };
  
  const findStrategicMove = (availableCells, board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
  
    for (let cell of availableCells) {
      let testBoard = [...board];
      testBoard[cell] = player;
      if (checkWinner(testBoard, player)) {
        log(`> CPU (Medium) found winning move: ${cell}\n`);
        return cell;
      }
  
      testBoard = [...board];
      testBoard[cell] = opponent;
      if (checkWinner(testBoard, opponent)) {
        log(`> CPU (Medium) found blocking move: ${cell}\n`);
        return cell;
      }
    }
    return null;
  };
  
  const getBestMove = (board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
  
    const minimax = (newBoard, currentPlayer, depth = 0, isMaximizing = true) => {
      const availableCells = newBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter((index) => index !== null);
  
      if (checkWinner(newBoard, player)) {
        return { score: 10 - depth };
      } else if (checkWinner(newBoard, opponent)) {
        return { score: depth - 10 };
      } else if (availableCells.length === 0) {
        return { score: 0 }; // Draw
      }
  
      // Limit depth for performance
      if (depth > 5) {
        return { score: 0 };
      }
  
      const moves = [];
      for (let cell of availableCells) {
        let testBoard = [...newBoard];
        testBoard[cell] = currentPlayer;
        
        const result = minimax(
          testBoard, 
          currentPlayer === 'X' ? 'O' : 'X',
          depth + 1,
          !isMaximizing
        );
        
        moves.push({ index: cell, score: result.score });
      }
  
      // Find best move
      if (isMaximizing) {
        const bestMove = moves.reduce((best, move) => 
          move.score > best.score ? move : best, { score: -Infinity });
        return bestMove;
      } else {
        const bestMove = moves.reduce((best, move) => 
          move.score < best.score ? move : best, { score: Infinity });
        return bestMove;
      }
    };
  
    return minimax(board, player).index;
  };
  
  const checkWinner = (board, player) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
  
    return winningCombos.some((combo) =>
      combo.every((index) => board[index] === player)
    );
  };  

  const checkDraw = (currentCells) => {
    return currentCells.every(cell => cell !== '');
  };

  const resetToSetup = () => {
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameSetup(false);
    setTurnIndicator('');
    setGameOver(false);
    setNextGameReady(false);
    setPlayerWins({ X: 0, O: 0 }); // Reset scores
    setProcessingMove(false); // Reset the processing flag
    setUsingFallback(false); // Reset fallback indicator
    setFallbackDismissed(false); // Reset dismissal flag
    log('> Reset to mode selection\n\n');
  };

  const saveGame = (state) => {
    try {
      localStorage.setItem('ticTacToeGameState', JSON.stringify(state));
      log('> Game state saved\n\n');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const loadGame = () => {
    try {
      const savedState = localStorage.getItem('ticTacToeGameState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  };

  const handleLoadGame = () => {
    const savedState = loadGame();
    if (savedState) {
      setCells(savedState.cells);
      setCurrentPlayer(savedState.currentPlayer);
      setGameSetup(true);
      setProcessingMove(false); // Reset processing flag when loading
      log('> Game loaded from saved state\n\n');
    } else {
      alert('No saved game found.');
      log('> No saved game found\n\n');
    }
  };

  const clearSavedGame = () => {
    try {
      localStorage.removeItem('ticTacToeGameState');
      alert('Saved game cleared.');
      log('> Saved game cleared\n\n');
    } catch (error) {
      console.error('Error clearing saved game:', error);
    }
  };

  const handlePlayerTypeChange = (player, newType) => {
    if (player === 'player1') {
      setPlayer1Type(newType);
    } else {
      setPlayer2Type(newType);
    }
    setPlayerWins({ X: 0, O: 0 }); // Reset scores when switching player type
  };

  const renderScoreboard = (wins, player) => {
    const scoreBoxes = Array(MAX_WINS_DISPLAY)
      .fill(null)
      .map((_, index) => (index < wins ? `[${player}]` : `[]`));
    return <div className="scoreboard-row">{scoreBoxes.join(' ')}</div>;
  };

  // Modify the difficulty dropdown rendering to enforce rules for Game Mode
  const renderDifficultyOptions = (player) => {
    const playerDifficulty = player === 'player1' ? player1Difficulty : player2Difficulty;
    const handleChange = (e) =>
      player === 'player1'
        ? setPlayer1Difficulty(e.target.value)
        : setPlayer2Difficulty(e.target.value);

    const allowedDifficulties =
      gameMode === 'Game'
        ? unlockedDifficulties // Restrict difficulties based on unlocks
        : ['Easy', 'Medium', 'Hard'];

    return (
      <select value={playerDifficulty} onChange={handleChange}>
        {allowedDifficulties.map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
    );
  };

  const resetToModeSelection = () => {
    setGameSetup(false);
    setModeSelection(true); // Return to mode selection
    setCells(Array(9).fill('')); // Clear the board
    setCurrentPlayer('X'); // Reset the current player
    setTurnIndicator('');
    setGameOver(false); // Reset game over state
    setNextGameReady(false); // Reset next game state
    setPlayer1Type('Human'); // Reset player types
    setPlayer2Type('CPU');
    setPlayer1Difficulty('Easy');
    setPlayer2Difficulty('Easy');
    setUnlockedDifficulties(['Easy']); // Reset unlocked difficulties
    setPlayerWins({ X: 0, O: 0 }); // Reset the scoreboard
    setProcessingMove(false); // Reset the processing flag
    setUsingFallback(false); // Reset fallback indicator
    setFallbackDismissed(false); // Reset dismissal flag
    log('> Reset to mode selection\n\n');
  };

  const MAX_WINS_TO_WIN_SERIES = 2; // Number of wins needed to win the series

  // JSX for mode selection
  if (modeSelection) {
    return (
      <div className="mode-selection">
        <h2>Select Game Mode</h2>
        <button onClick={() => handleModeSelection('Classic')}>Classic Mode</button>
        <button onClick={() => handleModeSelection('Game')}>Game Mode</button>
      </div>
    );
  }
    
  // Main rendering logic
  return (
    <div className="container">
      <h1>Tic Tac Toe</h1>

      {/* Reset to Mode Selection Button */}
      <button
        onClick={resetToModeSelection}
        className="reset-mode-selection-button"
      >
        Return to Mode Selection
      </button>

      {modeSelection ? (
        <div className="mode-selection">
          <h2>Select Game Mode</h2>
          <button onClick={() => handleModeSelection('Classic')}>Classic Mode</button>
          <button onClick={() => handleModeSelection('Game')}>Game Mode</button>
        </div>
      ) : gameSetup ? (
        <>
          <div className="scoreboard">
            <div>Player 1 (X): {renderScoreboard(playerWins.X, 'X')}</div>
            <div>Player 2 (O): {renderScoreboard(playerWins.O, 'O')}</div>
          </div>

          {gameSetup && usingFallback && !fallbackDismissed && (
          <div className="fallback-indicator" style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '10px',
            borderLeft: '5px solid #ffeeba'
          }}>
            <span style={{ fontWeight: 'bold' }}>⚠️ Using Classical Fallback Strategy</span>
            <p>Your quantum algorithm couldn't be executed as written. Check the log for details.</p>
            <p>The game is using a classical strategy to make moves instead.</p>
            <button onClick={() => setFallbackDismissed(true)} style={{
              border: 'none',
              backgroundColor: '#ffeeba',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}>
              Dismiss
           </button>
          </div>
         )}

          <div className="ticboard">
            {cells.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => handleCellClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>

          <p className="turn-indicator">{turnIndicator}</p>

          {nextGameReady && (
            <button onClick={startNextGame} className="next-game-button">
              Start Next Game
            </button>
          )}

          <div className="controls">
            <button onClick={resetToSetup}>Reset to Setup</button>
            <button onClick={() => saveGame({ cells, currentPlayer })}>Save</button>
            <button onClick={handleLoadGame}>Load</button>
            <button onClick={clearSavedGame}>Clear Save</button>
          </div>
        </>
      ) : (
        <div className="setup">
          <h2>{gameMode} Setup</h2>
          <label>
            Player 1 (X):
            <select value={player1Type} onChange={(e) => handlePlayerTypeChange('player1', e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
              <option value="Quantum CPU">Quantum CPU</option>
            </select>
          </label>
          {player1Type === 'CPU' && (
            <label>
              Player 1 CPU Difficulty:
              {renderDifficultyOptions('player1')}
            </label>
          )}
          <label>
            Player 2 (O):
            <select value={player2Type} onChange={(e) => handlePlayerTypeChange('player2', e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
              <option value="Quantum CPU">Quantum CPU</option>
            </select>
          </label>
          {player2Type === 'CPU' && (
            <label>
              Player 2 CPU Difficulty:
              {renderDifficultyOptions('player2')}
            </label>
          )}
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;