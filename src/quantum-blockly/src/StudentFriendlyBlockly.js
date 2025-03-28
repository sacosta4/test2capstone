// Replace your existing src/quantum-blockly/StudentFriendlyBlockly.js with this file
// Optimized for performance and to avoid update cycles

import React, { useState, useEffect, useRef } from 'react';
import Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

// Import blocks and generators - corrected imports
import { initStudentFriendlyBlocks } from './blocks/student_friendly_blocks';
import { initStudentFriendlyGenerators } from './generators/student_friendly_generators';
import { simplifiedStudentToolboxConfig } from './toolboxConfig';

// Import styles
import './StudentFriendlyBlockly.css';

const StudentFriendlyBlockly = ({ onCodeGenerated, parentWorkspace, isStudentMode }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [showTips, setShowTips] = useState(true);
  const [activeTip, setActiveTip] = useState(0);
  const blocklyRef = useRef(null);
  const workspaceRef = useRef(null);
  const tipIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Educational tips for students
  const tips = [
    "The center square is usually the strongest position on the board!",
    "Try to get three of your pieces in a row, column, or diagonal to win!",
    "If your opponent has two pieces in a row, you should block them!",
    "Corners are stronger positions than edges in Tic-Tac-Toe.",
    "The quantum computer chooses the position with the highest weight.",
    "Higher weight numbers mean better moves for the quantum computer.",
    "You can create your own strategy by assigning weights to different positions!"
  ];

  // Initialize blocks and generators
  useEffect(() => {
    try {
      // Initialize custom blocks and generators only once globally
      if (typeof window.studentBlocksInitialized === 'undefined') {
        if (typeof initStudentFriendlyBlocks === 'function') {
          initStudentFriendlyBlocks();
        }
        if (typeof initStudentFriendlyGenerators === 'function') {
          initStudentFriendlyGenerators();
        }
        window.studentBlocksInitialized = true;
        console.log("Student-friendly blocks initialized globally");
      }
    } catch (error) {
      console.error("Error initializing student-friendly blocks:", error);
    }
  }, []);

  // Effect to set up the Blockly workspace once
  useEffect(() => {
    // Only setup if we have a reference, are in student mode, and haven't initialized yet
    if (blocklyRef.current && isStudentMode && !isInitializedRef.current && !workspaceRef.current) {
      try {
        console.log("Creating student workspace");
        
        // Make a deep copy of the toolbox config to avoid reference issues
        const studentToolbox = JSON.parse(JSON.stringify(simplifiedStudentToolboxConfig));
        
        const newWorkspace = Blockly.inject(blocklyRef.current, {
          toolbox: studentToolbox,
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
          },
          trashcan: true,
          renderer: 'zelos',
          theme: Blockly.Themes.Modern,
          maxInstances: 20, // Limit instances to prevent memory issues
          maxBlocks: 50 // Limit max blocks to prevent memory issues
        });

        // Save the workspace reference
        workspaceRef.current = newWorkspace;
        isInitializedRef.current = true;

        // Add change listener to generate code (with debounce to prevent memory issues)
        let debounceTimeout;
        const changeListener = () => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            if (workspaceRef.current) {
              try {
                const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
                if (typeof onCodeGenerated === 'function') {
                  onCodeGenerated(code);
                }
              } catch (error) {
                console.error("Error generating code:", error);
              }
            }
          }, 500);
        };
        
        newWorkspace.addChangeListener(changeListener);

        // Start tip rotation interval
        tipIntervalRef.current = setInterval(() => {
          setActiveTip(prevTip => (prevTip + 1) % tips.length);
        }, 10000);

        // Return cleanup function
        return () => {
          // Clear any lingering timeouts to prevent memory leaks
          clearTimeout(debounceTimeout);
          
          if (tipIntervalRef.current) {
            clearInterval(tipIntervalRef.current);
            tipIntervalRef.current = null;
          }
          
          // Properly dispose of workspace to free memory
          if (workspaceRef.current) {
            try {
              workspaceRef.current.removeChangeListener(changeListener);
              workspaceRef.current.dispose();
              workspaceRef.current = null;
              isInitializedRef.current = false;
            } catch (error) {
              console.error("Error disposing student workspace:", error);
            }
          }
        };
      } catch (error) {
        console.error("Error initializing Blockly workspace:", error);
      }
    }
    
    // Cleanup when leaving student mode
    return () => {
      if (tipIntervalRef.current) {
        clearInterval(tipIntervalRef.current);
        tipIntervalRef.current = null;
      }
      
      if (!isStudentMode && workspaceRef.current) {
        try {
          workspaceRef.current.dispose();
          workspaceRef.current = null;
          isInitializedRef.current = false;
        } catch (error) {
          console.error("Error cleaning up student workspace:", error);
        }
      }
    };
  }, [blocklyRef, isStudentMode, onCodeGenerated, tips]);

  // Function to add a block to the workspace
  const addBlockToWorkspace = (blockType) => {
    if (workspaceRef.current && isInitializedRef.current) {
      try {
        const block = workspaceRef.current.newBlock(blockType);
        block.initSvg();
        block.render();
        
        // Position the block in the center of the workspace viewpoint
        const metrics = workspaceRef.current.getMetrics();
        if (metrics) {
          const x = metrics.viewWidth / 2 - 100;
          const y = metrics.viewHeight / 3;
          block.moveBy(x, y);
        }
        
        // Force a render to ensure changes are visible
        workspaceRef.current.render();
      } catch (error) {
        console.error(`Error adding block ${blockType}:`, error);
      }
    }
  };

  // Handle difficulty change
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  // Examples for students to use
  const examples = [
    { 
      name: "Center First Strategy",
      blockType: "simple_strategy" 
    },
    { 
      name: "Win & Block Strategy",
      blockType: "win_detection_strategy" 
    },
    { 
      name: "Complete Strategy",
      blockType: "complete_strategy" 
    }
  ];

  if (!isStudentMode) {
    return null; // Don't render anything in regular mode
  }

  return (
    <div className="student-friendly-blockly">
      <div className="student-header">
        <h1>Quantum Tic-Tac-Toe for Students</h1>
        <div className="student-controls">
          <div className="difficulty-selector">
            <label>Difficulty:</label>
            <select value={difficulty} onChange={handleDifficultyChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button className="tips-toggle" onClick={() => setShowTips(!showTips)}>
            {showTips ? "Hide Tips" : "Show Tips"}
          </button>
        </div>
      </div>

      {showTips && (
        <div className="tips-panel">
          <h3>💡 Did you know?</h3>
          <p className="active-tip">{tips[activeTip]}</p>
        </div>
      )}

      <div className="blockly-quick-actions">
        <h3>Quick Start: Add a Block</h3>
        <div className="quick-blocks">
          <button 
            onClick={() => addBlockToWorkspace("simple_strategy")}
            className="block-button easy"
          >
            Simple Strategy
          </button>
          <button 
            onClick={() => addBlockToWorkspace("win_detection_strategy")}
            className="block-button medium"
          >
            Smart Strategy
          </button>
          <button 
            onClick={() => addBlockToWorkspace("complete_strategy")}
            className="block-button hard"
          >
            Complete Strategy
          </button>
        </div>
      </div>

      <div className="blockly-examples">
        <h3>Example Strategies</h3>
        <div className="examples-list">
          {examples.map((example, index) => (
            <div key={index} className="example-item">
              <h4>{example.name}</h4>
              <button 
                onClick={() => addBlockToWorkspace(example.blockType)}
                className="example-button"
              >
                Try It
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="blockly-container">
        <div 
          ref={blocklyRef} 
          className="blockly-area"
          style={{ width: '100%', height: '500px' }}
        ></div>
      </div>

      <div className="blockly-help">
        <h3>How to Create Your Quantum Strategy</h3>
        <ol>
          <li>Drag blocks from the toolbox on the left into the workspace</li>
          <li>Connect blocks together to build your strategy</li>
          <li>Click "Generate Code" to test your strategy against the computer</li>
          <li>Watch your quantum algorithm play Tic-Tac-Toe!</li>
        </ol>
      </div>
    </div>
  );
};

export default StudentFriendlyBlockly;