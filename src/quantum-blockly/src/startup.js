/**
 * Enhanced startup script for Quantum Blockly
 * This script runs before the application loads to clean up
 * any corrupted state from previous sessions and setup memory monitoring
 */

(function() {
    console.log('Running enhanced startup script...');
    
    // Track startup time
    const startTime = performance.now();
    
    // Check if coming from crash
    const previousErrorState = sessionStorage.getItem('lastSessionError') === 'true';
    const previouslyRecovered = sessionStorage.getItem('recovered') === 'true';
    
    // Clear error state flags
    sessionStorage.removeItem('lastSessionError');
    sessionStorage.removeItem('recovered');
    
    // Keep track of keys to preserve (important app state you don't want to lose)
    const keysToKeep = ['ticTacToeGameState', 'connect4GameState'];
    
    // Key prefixes to clean - any keys that start with these will be removed
    const prefixesToClean = [
      'blockly',
      'QUBO',
      'workspace',
      'quantum',
      'temp',
      'draft'
    ];
    
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    // Clean localStorage
    for (const key of keys) {
      // Check if this key is in the preserved list
      if (keysToKeep.includes(key)) {
        continue;
      }
      
      // Check if key matches any of the prefixes to clean
      const shouldClean = prefixesToClean.some(prefix => 
        key.toLowerCase().includes(prefix.toLowerCase())
      );
      
      if (shouldClean) {
        try {
          localStorage.removeItem(key);
          cleanedCount++;
        } catch (e) {
          console.error(`Failed to remove localStorage key ${key}:`, e);
        }
      }
    }
    
    // Clean sessionStorage except for essential items
    const sessionKeys = Object.keys(sessionStorage);
    let sessionCleanedCount = 0;
    
    for (const key of sessionKeys) {
      // Skip essential keys
      if (['cleanStartup', 'userSettings'].includes(key)) {
        continue;
      }
      
      try {
        sessionStorage.removeItem(key);
        sessionCleanedCount++;
      } catch (e) {
        console.error(`Failed to remove sessionStorage key ${key}:`, e);
      }
    }
    
    // Set flag to indicate clean startup
    sessionStorage.setItem('cleanStartup', 'true');
    
    // Add error monitoring and recovery
    let errorCount = 0;
    
    window.addEventListener('error', function(event) {
      errorCount++;
      console.error('Application error:', event.error);
      
      // Mark session as having an error
      sessionStorage.setItem('lastSessionError', 'true');
      
      // Auto-recovery after 3 consecutive errors
      if (errorCount >= 3) {
        console.warn('Multiple errors detected. Attempting automatic recovery...');
        setTimeout(() => {
          // Attempt to recover automatically
          window.recoverApplication();
        }, 1000);
      }
    });
    
    // Memory monitoring setup
    if (window.performance && window.performance.memory) {
      // Initial memory values
      let initialHeapSize = window.performance.memory.usedJSHeapSize;
      let maxHeapSize = initialHeapSize;
      let lastHeapSize = initialHeapSize;
      const heapLimit = window.performance.memory.jsHeapSizeLimit;
      
      // Setup memory monitoring
      const memoryMonitor = setInterval(() => {
        try {
          const currentHeap = window.performance.memory.usedJSHeapSize;
          
          // Track maximum heap size seen
          if (currentHeap > maxHeapSize) {
            maxHeapSize = currentHeap;
          }
          
          // Check for memory leaks (rapid increase)
          if (currentHeap > lastHeapSize * 1.5 && currentHeap > 100 * 1048576) { // 100MB
            console.warn('Possible memory leak detected', {
              previousMB: Math.round(lastHeapSize / 1048576),
              currentMB: Math.round(currentHeap / 1048576),
              maxSeenMB: Math.round(maxHeapSize / 1048576),
              limitMB: Math.round(heapLimit / 1048576)
            });
          }
          
          // Check if memory usage is too high (over 90% of limit)
          if (currentHeap > heapLimit * 0.9) {
            console.warn('Critical memory usage! Attempting cleanup...', {
              usedMB: Math.round(currentHeap / 1048576),
              limitMB: Math.round(heapLimit / 1048576),
              percentage: Math.round((currentHeap / heapLimit) * 100) + '%'
            });
            
            // Add code to force cleanup
            try {
              // Try to release memory
              let largeArray = new Array(10000).fill(0);
              largeArray = null;
              
              // Force reflow to trigger browser optimizations
              document.body.offsetHeight;
            } catch (e) {
              console.error('Error during emergency memory cleanup:', e);
            }
          }
          
          lastHeapSize = currentHeap;
        } catch (e) {
          console.error('Error in memory monitor:', e);
        }
      }, 15000); // Check every 15 seconds
      
      // Clean up the interval when the page unloads
      window.addEventListener('beforeunload', () => {
        clearInterval(memoryMonitor);
      });
    }
    
    // Show recovery button if coming from error state
    if (previousErrorState || previouslyRecovered) {
      document.addEventListener('DOMContentLoaded', function() {
        const message = previouslyRecovered 
          ? 'Application was recovered from a crash'
          : 'Previous session ended with an error';
        
        console.log(message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#fff3cd';
        notification.style.color = '#856404';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show with slight delay and auto-hide
        setTimeout(() => {
          notification.style.opacity = '1';
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            notification.style.opacity = '0';
            
            // Remove after fade out
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 500);
          }, 5000);
        }, 1000);
      });
    }
    
    // Add global recovery function
    window.recoverApplication = window.recoverApplication || function() {
      // Clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Set recovery flag
        sessionStorage.setItem('recovered', 'true');
        
        // Reload the page
        window.location.reload();
      } catch (e) {
        console.error('Error during recovery:', e);
        
        // Last resort - redirect to clean URL
        window.location.href = window.location.pathname;
      }
    };
    
    // Report startup metrics
    const endTime = performance.now();
    console.log(`Startup script completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Cleaned ${cleanedCount} localStorage items and ${sessionCleanedCount} sessionStorage items`);
    
    // Report memory usage if available
    if (window.performance && window.performance.memory) {
      console.log('Initial memory usage:', 
        Math.round(window.performance.memory.usedJSHeapSize / 1048576) + 'MB',
        'of',
        Math.round(window.performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
      );
    }
  })();