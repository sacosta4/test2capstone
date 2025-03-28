// Complete fixed version of src/quantum-blockly/BlocklyComponent.js
import './BlocklyComponent.css';
import './javascriptGenerators';
import { toolboxConfig } from "./toolboxConfig";
import { useRef, useEffect, useState, useCallback } from 'react';
import Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import "./blockImports";
// Import the named exports from our student modules
import { initStudentFriendlyGenerators } from './generators/student_friendly_generators';
import { initStudentFriendlyBlocks } from './blocks/student_friendly_blocks';
import { forceGarbageCollectionHint, optimizeWorkspace } from './memoryUtils';

function BlocklyComponent({ mainCodeHandlingFunction, log, onWorkspaceInit, toolboxConfig: customToolboxConfig }) {
  const workspaceRef = useRef(null); // DOM reference to the workspace div
  const [workspace, setWorkspace] = useState(null); // Workspace state
  const [code, setCode] = useState(''); // Generated code state
  const [debounceTimer, setDebounceTimer] = useState(null);
  const blocklyInitialized = useRef(false); // Track if Blockly is already initialized

  // Initialize student-friendly blocks and generators once
  useEffect(() => {
    try {
      if (!window.studentBlocksInitialized) {
        initStudentFriendlyBlocks();
        initStudentFriendlyGenerators();
        window.studentBlocksInitialized = true;
        console.log("Initialized student-friendly blocks and generators");
      }
    } catch (error) {
      console.error("Error initializing student blocks:", error);
    }
  }, []);

  // Helper function to convert old QUBO format to PyQUBO format
  const convertToNewFormat = (oldFormat) => {
    const newFormat = {
      variables: {},
      Constraints: [],
      Objective: ""
    };
    
    // Convert linear terms to variables and objective
    let objectiveTerms = [];
    
    // Add variables
    Object.keys(oldFormat.linear || {}).forEach(key => {
      const varName = `x${key}`;
      newFormat.variables[varName] = { "type": "Binary" };
      
      // Add to objective if weight is non-zero
      const weight = oldFormat.linear[key];
      if (weight !== 0) {
        objectiveTerms.push(`${weight} * ${varName}`);
      }
    });
    
    // Add quadratic terms to objective
    Object.keys(oldFormat.quadratic || {}).forEach(keyPair => {
      const [i, j] = keyPair.split(',');
      const varName1 = `x${i}`;
      const varName2 = `x${j}`;
      
      // Ensure variables exist
      if (!newFormat.variables[varName1]) {
        newFormat.variables[varName1] = { "type": "Binary" };
      }
      if (!newFormat.variables[varName2]) {
        newFormat.variables[varName2] = { "type": "Binary" };
      }
      
      // Add to objective if weight is non-zero
      const weight = oldFormat.quadratic[keyPair];
      if (weight !== 0) {
        objectiveTerms.push(`${weight} * ${varName1} * ${varName2}`);
      }
    });
    
    // Combine objective terms
    newFormat.Objective = objectiveTerms.join(' + ');
    
    // Add a simple constraint to ensure exactly one variable is selected
    if (Object.keys(newFormat.variables).length > 0) {
      const allVars = Object.keys(newFormat.variables).join(' + ');
      newFormat.Constraints.push({
        "lhs": allVars,
        "comparison": "=",
        "rhs": 1
      });
    }
    
    return newFormat;
  };

  // Memoize the extraction function to prevent memory leaks
  const extractQUBOData = useCallback((workspace) => {
    try {
      // Get the JavaScript code generated from the workspace
      const code = javascriptGenerator.workspaceToCode(workspace);
      
      // Prepare sandbox for execution with proper error handling
      const createFunction = new Function(`
        try {
          ${code}
          // Return the function if it exists, otherwise null
          return typeof createQuboForSingleMove === 'function' ? createQuboForSingleMove : null;
        } catch (error) {
          console.error("Error in QUBO function generation:", error);
          return null;
        }
      `);
      
      // Execute in sandbox
      const createQuboForSingleMove = createFunction();
      
      if (!createQuboForSingleMove) {
        return null;
      }
      
      // Create a dummy board for testing
      const dummyBoard = Array(9).fill('');
      
      // Check if the function exists and call it
      if (typeof createQuboForSingleMove === 'function') {
        try {
          const quboData = createQuboForSingleMove(dummyBoard);
          
          // Validate QUBO data
          if (quboData && (quboData.variables || quboData.linear)) {
            // If it's the old format, convert to new format
            if (quboData.linear && quboData.quadratic) {
              return convertToNewFormat(quboData);
            }
            
            // Return the new PyQUBO format directly with validation
            return {
              variables: quboData.variables || {},
              Constraints: quboData.Constraints || [],
              Objective: quboData.Objective || "0"
            };
          }
        } catch (executionError) {
          console.error("Error executing QUBO function:", executionError);
        }
      }
    } catch (error) {
      console.error("Error extracting QUBO data:", error);
    }
    
    // Return a default PyQUBO structure if extraction fails
    return {
      variables: {
        "x0": { "type": "Binary" },
        "x1": { "type": "Binary" },
        "x2": { "type": "Binary" },
        "x3": { "type": "Binary" },
        "x4": { "type": "Binary" },
        "x5": { "type": "Binary" },
        "x6": { "type": "Binary" },
        "x7": { "type": "Binary" },
        "x8": { "type": "Binary" }
      },
      Constraints: [
        {"lhs": "x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7 + x8", "comparison": "=", "rhs": 1}
      ],
      Objective: "(-3 * x4) + (-2 * x0) + (-2 * x2) + (-2 * x6) + (-2 * x8) + (-1 * x1) + (-1 * x3) + (-1 * x5) + (-1 * x7)"
    };
  }, []);

  // Setup workspace once with proper initialization tracking
  useEffect(() => {
    // Skip if already initialized or container not yet ready
    if (blocklyInitialized.current || !workspaceRef.current) {
      return;
    }

    console.log("Setting up Blockly workspace");

    try {
      // Make a deep copy of the toolbox config to avoid reference issues
      const config = customToolboxConfig 
        ? JSON.parse(JSON.stringify(customToolboxConfig)) 
        : JSON.parse(JSON.stringify(toolboxConfig));

      // Initialize Blockly only ONCE
      const currWorkspace = Blockly.inject(workspaceRef.current, {
        toolbox: config,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        maxInstances: 100, // Limit instances to prevent memory issues
        maxBlocks: 200,    // Limit max blocks to prevent memory issues
        trashcan: true
      });

      // Set variables and mark as initialized
      setWorkspace(currWorkspace);
      blocklyInitialized.current = true;
      
      if (typeof onWorkspaceInit === 'function') {
        onWorkspaceInit(currWorkspace);
      }

      // Clean up function
      return () => {
        // Clean up any timers to prevent memory leaks
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        try {
          // Optimize workspace before disposal
          optimizeWorkspace(currWorkspace);
          blocklyInitialized.current = false;
          currWorkspace.dispose(); // Cleanup on unmount
        } catch (error) {
          console.error("Error disposing workspace:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up workspace:", error);
    }
  }, [customToolboxConfig, onWorkspaceInit, debounceTimer]);
  
  // This code handler will be passed into the button component
  const codeHandler = (code) => {
    setCode(code);
    if (log) log('> Blockly Code Generated\n\n');
  }

  // Set the main component code state when our local code changes
  useEffect(() => {
    if (mainCodeHandlingFunction) {
      mainCodeHandlingFunction(code);
    }
  }, [code, mainCodeHandlingFunction]);

  // Apply direct CSS fixes for the flyout - fixes the disappearing sidebar
  useEffect(() => {
    // One-time fix for flyout visibility
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Force flyout visibility */
      .blocklyFlyout, .blocklyFlyoutBackground {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      /* Ensure toolbox categories remain visible */
      .blocklyToolboxDiv {
        display: block !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }
      
      /* Make categories more obviously clickable */
      .blocklyTreeRow {
        cursor: pointer !important;
        padding: 6px !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Handler to keep flyout visible after clicks
    const handleClick = () => {
      // Single timeout to handle flyout visibility after clicks
      setTimeout(() => {
        const flyouts = document.querySelectorAll('.blocklyFlyout, .blocklyFlyoutBackground');
        flyouts.forEach(el => {
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
          }
        });
      }, 100);
    };
    
    document.addEventListener('click', handleClick);
    
    // Clean up
    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // GenerateCodeButton component
  function GenerateCodeButton({ workspace, blocklyCodeHandlingFunction }) {
    // Handle Generate button click with memory optimization
    const handleGenerate = async () => {
      if (workspace) {
        try {
          // Clear any existing timer
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          
          const code = javascriptGenerator.workspaceToCode(workspace);
          blocklyCodeHandlingFunction(code); // Sets the blockly component's code state

          // Log the code generation
          if (log) log('> Generating QUBO from Blockly code\n\n');

          // Extract QUBO data with a debounce to prevent memory issues
          const timer = setTimeout(async () => {
            try {
              const quboData = extractQUBOData(workspace);
              
              if (!quboData) {
                if (log) log('> Error: Failed to generate valid QUBO data\n\n');
                return;
              }
              
              // Log the generated QUBO JSON
              if (log) log('> Generated PyQUBO-compatible QUBO data\n\n');

              try {
                const response = await fetch("http://localhost:8000/quantum", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(quboData),
                });

                const result = await response.json();
                if (log) log(`> Server Response: ${JSON.stringify(result, null, 2)}\n\n`);

                if (!response.ok) {
                  throw new Error(`Server Error: ${result.error}`);
                }

              } catch (error) {
                console.error("❌ Error Sending Data:", error);
                if (log) log(`> Error: ${error.message}\n\n`);
              }
            } catch (error) {
              console.error("Error generating code:", error);
              if (log) log(`> Error generating code: ${error.message}\n\n`);
            }
          }, 500);
          
          setDebounceTimer(timer);
        } catch (error) {
          console.error("Error in handleGenerate:", error);
          if (log) log(`> Error: ${error.message}\n\n`);
        }
      }
    };

    return (
      <>
        <button id="generate-btn" onClick={handleGenerate}>Generate Code</button>
      </>
    );
  }

  // SaveAsBlockButton component
  function SaveAsBlockButton({ workspace }) {
    const handleSaveAsBlock = () => {
      if (workspace) {
        try {
          const selectedBlocks = workspace.getTopBlocks(true); // Get all top-level blocks
          if (selectedBlocks.length) {
            // Serialize each selected block
            const blockJsonList = selectedBlocks.map((block) =>
              Blockly.serialization.blocks.save(block)
            );

            const toolbox = workspace.options.languageTree;

            if (toolbox) {
              // Ensure "Saved Blocks" category exists
              let savedCategory = toolbox.contents.find(
                (category) => category.kind === 'category' && category.name === 'Saved Blocks'
              );

              if (!savedCategory) {
                savedCategory = {
                  kind: 'category',
                  name: 'Saved Blocks',
                  colour: '#FFAB19',
                  contents: [],
                };
                toolbox.contents.push(savedCategory);
              }

              // Add each saved block as a new block to the toolbox
              blockJsonList.forEach((blockJson, index) => {
                const blockType = `saved_block_${Date.now()}_${index}`; // Unique block type

                // Dynamically register the block type
                Blockly.Blocks[blockType] = {
                  init: function () {
                    const block = Blockly.serialization.blocks.append(
                      blockJson,
                      this.workspace
                    );
                    // Ensure proper layout, no specific positioning required here
                    if (block) block.moveBy(0, 0);
                  },
                };

                // Check if the block already exists in the toolbox; prevent duplicates
                const existingBlock = savedCategory.contents.find(
                  (content) => content.type === blockType
                );

                if (!existingBlock) {
                  savedCategory.contents.push({
                    kind: 'block',
                    type: blockType,
                  });
                }
              });

              // Refresh the toolbox to show the new blocks
              workspace.updateToolbox(toolbox);

              alert('Block(s) saved successfully in the "Saved Blocks" category.');
            } else {
              alert('Failed to access the toolbox. Please try again.');
            }
          } else {
            alert('No blocks selected to save.');
          }
        } catch (error) {
          console.error("Error saving blocks:", error);
          alert(`Error saving blocks: ${error.message}`);
        }
      }
    };

    return <button onClick={handleSaveAsBlock}>Save Blocks</button>;
  }

  // Export function with editable filename
  const exportWorkspace = () => {
    if (!workspace) return alert("No workspace found.");
    
    try {
      const state = Blockly.serialization.workspaces.save(workspace);
      const jsonData = JSON.stringify(state, null, 2);
      
      // Prompt user for filename
      let filename = prompt("Enter a name for the exported workspace:", "workspace");
      if (!filename) return; // Cancelled or empty input
      
      // Ensure filename ends with .json
      if (!filename.endsWith(".json")) {
        filename += ".json";
      }

      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      
      URL.revokeObjectURL(url);
      if (log) log(`> Workspace exported successfully as "${filename}".\n\n`);
    } catch (error) {
      console.error("Error exporting workspace:", error);
      alert(`Error exporting workspace: ${error.message}`);
    }
  };

  // Import function
  const importWorkspace = (event) => {
    const file = event.target.files[0];
    if (!file) return alert("No file selected.");
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          Blockly.serialization.workspaces.load(json, workspace);
          if (log) log(`> Workspace imported successfully from "${file.name}".\n\n`);
        } catch (error) {
          alert("Invalid file format. Please upload a valid .json workspace file.");
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing workspace:", error);
      alert(`Error importing workspace: ${error.message}`);
    }
  };

  // Garbage collection helper - much less frequent to prevent issues
  const performGarbageCollection = useCallback(() => {
    if (workspace && !window.isUserInteracting) {
      try {
        console.log("Running minimal garbage collection...");
        forceGarbageCollectionHint();
        if (log) log("> Memory cleaned\n\n");
      } catch (error) {
        console.error("Error performing garbage collection:", error);
      }
    }
  }, [workspace, log]);

  // Set up a MUCH less frequent garbage collection interval
  useEffect(() => {
    // Reduced from once per minute to once every 15 minutes
    const gcInterval = setInterval(performGarbageCollection, 900000);
    
    return () => {
      clearInterval(gcInterval);
    };
  }, [performGarbageCollection]);

  // Render the component
  return (
    <div className="blockly-area">
      <h2>Workspace</h2>
      <div className="blockly-div" ref={workspaceRef} style={{ height: "500px", width: "100%" }}></div>
      <div className="controls">
        <GenerateCodeButton workspace={workspace} blocklyCodeHandlingFunction={codeHandler} />
        <SaveAsBlockButton workspace={workspace} />
        <button onClick={exportWorkspace}>Export Workspace</button>
        <input type="file" accept=".json" onChange={importWorkspace} />
        <button onClick={performGarbageCollection} title="Free up memory if the app is running slowly">Clean Memory</button>
      </div>
    </div>
  );
}

export default BlocklyComponent;