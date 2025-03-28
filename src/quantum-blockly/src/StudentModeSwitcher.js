// Replace your existing src/quantum-blockly/StudentModeSwitcher.js with this file
// This is a performance-optimized version that prevents the maximum update depth errors

import React, { useState, useEffect, useRef } from 'react';
import Blockly from 'blockly/core';
import StudentFriendlyBlockly from './StudentFriendlyBlockly';
import { toolboxConfig, simplifiedStudentToolboxConfig } from './toolboxConfig';
import './StudentModeSwitcher.css';

const StudentModeSwitcher = ({ workspace, onCodeGenerated }) => {
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [toolboxUpdatePending, setToolboxUpdatePending] = useState(false);
  const originalToolboxConfig = useRef(null);
  const isUpdatingToolbox = useRef(false);

  // Save original toolbox configuration when component mounts
  useEffect(() => {
    if (workspace && !originalToolboxConfig.current) {
      try {
        // Store the original toolbox config for restoration later
        // We use a deep copy to prevent reference issues
        const originalConfig = JSON.parse(JSON.stringify(toolboxConfig));
        originalToolboxConfig.current = originalConfig;
        
        console.log("Original toolbox config saved");
      } catch (error) {
        console.error("Error saving original toolbox:", error);
      }
    }
  }, [workspace]);

  // Handle toolbox update when mode changes - with safety checks
  useEffect(() => {
    if (!workspace || !toolboxUpdatePending || isUpdatingToolbox.current) {
      return;
    }

    // Indicate we're in the process of updating to prevent recursion
    isUpdatingToolbox.current = true;
    setToolboxUpdatePending(false);
    
    // Delay the update slightly to let other state changes settle
    const updateTimer = setTimeout(() => {
      try {
        // Clear the workspace to prevent conflicts
        workspace.clear();
        
        // Clear undo stack to prevent memory issues
        workspace.clearUndo();
        
        if (isStudentMode) {
          // Switching to student mode - use simplified student toolbox
          console.log("Switching to student mode with simplified toolbox");
          // Create a fresh copy of the config to avoid mutation issues
          const studentConfig = JSON.parse(JSON.stringify(simplifiedStudentToolboxConfig));
          workspace.updateToolbox(studentConfig);
        } else if (originalToolboxConfig.current) {
          // Switching back to regular mode - restore original toolbox
          console.log("Switching back to regular mode with original toolbox");
          // Create a fresh copy of the config to avoid mutation issues
          const originalConfig = JSON.parse(JSON.stringify(originalToolboxConfig.current));
          workspace.updateToolbox(originalConfig);
        }
        
        // Force refresh the toolbox selection
        workspace.refreshToolboxSelection();
        
        // Force render the workspace
        workspace.render();
        
        console.log(`Mode switched to ${isStudentMode ? 'student' : 'regular'} mode successfully`);
      } catch (error) {
        console.error("Error updating toolbox:", error);
      } finally {
        // Reset the updating flag
        isUpdatingToolbox.current = false;
      }
    }, 100);
    
    return () => {
      clearTimeout(updateTimer);
    };
  }, [workspace, isStudentMode, toolboxUpdatePending]);

  // Handle toggling student mode
  const handleModeToggle = () => {
    if (!workspace || isUpdatingToolbox.current) {
      console.error("Cannot toggle mode: workspace unavailable or update in progress");
      return;
    }

    // Set the new mode state - toolbox update will happen in effect
    setIsStudentMode(prevMode => !prevMode);
    setToolboxUpdatePending(true);
  };

  // When student mode is on, code generated from student blocks
  // needs to be passed up to the parent component
  const handleStudentCodeGenerated = (code) => {
    if (onCodeGenerated && code) {
      onCodeGenerated(code);
    }
  };

  return (
    <div className="student-mode-container">
      <div className="mode-toggle-wrapper">
        <button 
          className={`mode-toggle-button ${isStudentMode ? 'student-active' : ''}`}
          onClick={handleModeToggle}
          disabled={isUpdatingToolbox.current}
        >
          {isStudentMode ? 'Switch to Regular Mode' : 'Switch to Student Mode'}
        </button>
        
        {isStudentMode && (
          <div className="student-mode-label">
            <span role="img" aria-label="student">👨‍🎓</span> Student Mode Active
          </div>
        )}
      </div>
      
      {isStudentMode && (
        <StudentFriendlyBlockly 
          onCodeGenerated={handleStudentCodeGenerated}
          parentWorkspace={workspace}
          isStudentMode={isStudentMode}
        />
      )}
    </div>
  );
};

export default StudentModeSwitcher;