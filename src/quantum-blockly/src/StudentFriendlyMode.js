// src/quantum-blockly/src/StudentFriendlyMode.js
import React, { useState, useEffect } from 'react';
import Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import './StudentFriendlyMode.css';

// Import student-friendly components
import StudentFriendlyBlockly from './StudentFriendlyBlockly';
import { simplifiedStudentToolboxConfig, studentFriendlyToolboxConfig } from '../studentFriendlyToolboxConfig';

// Import blocks
import './blocks/student_friendly_blocks';
import './generators/student_friendly_generators';
import { initStudentFriendlyBlocks } from './blocks/student_friendly_blocks';
import { initStudentFriendlyGenerators } from './generators/student_friendly_generators';

const StudentFriendlyMode = ({ onGenerateCode, workspace, isStudentMode, setIsStudentMode }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [codeGenerated, setCodeGenerated] = useState('');
  
  // Initialize student-friendly blocks and generators
  useEffect(() => {
    initStudentFriendlyBlocks();
    initStudentFriendlyGenerators();
  }, []);
  
  // Function to switch toolbox when student mode is toggled
  useEffect(() => {
    if (workspace) {
      if (isStudentMode) {
        workspace.updateToolbox(simplifiedStudentToolboxConfig);
      } else {
        workspace.updateToolbox(studentFriendlyToolboxConfig);
      }
    }
  }, [isStudentMode, workspace]);
  
  // Handle code generation
  const handleCodeGenerated = (code) => {
    setCodeGenerated(code);
    if (typeof onGenerateCode === 'function') {
      onGenerateCode(code);
    }
  };
  
  // Generate a student-friendly version of the code
  const simplifyCode = (code) => {
    if (!code) return '';
    
    // Split the code into lines
    const lines = code.split('\n');
    
    // Find key sections and simplify
    let simplified = [];
    let inFunction = false;
    let objectiveSection = false;
    
    for (const line of lines) {
      if (line.includes('function createQuboForSingleMove')) {
        simplified.push('// This is my Quantum Tic-Tac-Toe strategy!');
        simplified.push(line);
        inFunction = true;
      } 
      else if (inFunction) {
        if (line.includes('variables')) {
          simplified.push('  // Creating variables for each empty space on the board');
        }
        else if (line.includes('objective')) {
          simplified.push('  // Setting weights for each position (higher is better!)');
          objectiveSection = true;
        }
        else if (objectiveSection && line.includes('*')) {
          // This is a weight assignment line
          simplified.push(`  ${line} // This position is important!`);
        }
        else if (line.includes('constraints')) {
          simplified.push('  // Making sure the quantum computer only picks one move');
          objectiveSection = false;
        }
        else if (line.includes('return')) {
          simplified.push('  // Sending the strategy to the quantum computer');
          simplified.push(line);
        }
      }
    }
    
    return simplified.join('\n');
  };
  
  return (
    <div className={`student-friendly-mode ${isStudentMode ? 'active' : ''}`}>
      <div className="student-mode-header">
        <h1>Quantum Tic-Tac-Toe for Students</h1>
        
        <div className="mode-controls">
          <button 
            className={`mode-toggle ${isStudentMode ? 'active' : ''}`}
            onClick={() => setIsStudentMode(!isStudentMode)}
          >
            {isStudentMode ? 'Switch to Regular Mode' : 'Switch to Student Mode'}
          </button>
          
          {isStudentMode && (
            <div className="difficulty-selector">
              <label>Difficulty: </label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {isStudentMode && (
        <>
          <StudentFriendlyBlockly 
            onCodeGenerated={handleCodeGenerated}
            workspace={workspace}
          />
          
          {codeGenerated && (
            <div className="student-code-display">
              <h3>Your Quantum Code</h3>
              <div className="code-explanation">
                <p>This is the quantum strategy you built:</p>
                <pre>{simplifyCode(codeGenerated)}</pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentFriendlyMode;