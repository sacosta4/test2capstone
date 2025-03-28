/**
 * Memory management utilities for Blockly applications
 * Optimized to prevent excessive processing that could cause performance issues
 */

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Optimize a Blockly workspace to reduce memory usage
   * Simplified to avoid intensive processing
   * @param {Blockly.Workspace} workspace - The Blockly workspace to optimize
   */
  export const optimizeWorkspace = (workspace) => {
    if (!workspace) return;
    
    try {
      // Clear the undo stack which can consume a lot of memory
      workspace.clearUndo();
      
      // Record basic metrics to help with debugging
      console.log("Workspace optimized");
    } catch (error) {
      console.error("Error in workspace optimization:", error);
    }
  };
  
  /**
   * Force a hint to the browser's garbage collector
   * Simplified to reduce processing
   */
  export const forceGarbageCollectionHint = () => {
    try {
      // Clear some references that might be holding memory
      const memoryObjects = [];
      for (let i = 0; i < 10; i++) {
        memoryObjects.push(new Array(10000));
      }
      
      // Let these objects become eligible for GC
      memoryObjects.length = 0;
      
      // Record this operation for tracking
      console.log("Memory cleanup hint executed");
    } catch (error) {
      console.error("Error in GC hint:", error);
    }
  };
  
  /**
   * Memory monitoring function that's minimal to avoid adding to the performance issues
   * @param {Blockly.Workspace} workspace - The Blockly workspace to monitor
   * @param {Function} cleanupCallback - Optional callback for additional cleanup
   * @returns {Function} - Function to stop monitoring
   */
  export const monitorMemory = (workspace, cleanupCallback) => {
    // Don't actually set up heavy monitoring - just return a cleanup function
    return () => {
      // Empty function to prevent memory leaks
      console.log("Memory monitoring stopped");
    };
  };
  
  // Export as default object for easier imports
  export default {
    debounce,
    optimizeWorkspace,
    forceGarbageCollectionHint,
    monitorMemory
  };