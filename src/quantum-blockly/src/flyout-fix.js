// Add this file to your public folder as flyout-fix.js
// This standalone script will help fix the disappearing sidebar issue

(function() {
    console.log('Initializing Blockly flyout fix...');
    
    // Keep track of fix attempts to limit console spam
    let fixAttempts = 0;
    
    // Main fix function to keep flyouts visible
    function keepFlyoutVisible() {
      fixAttempts++;
      
      // Only log occasionally to reduce console noise
      if (fixAttempts % 20 === 0) {
        console.log("Applying flyout visibility fix");
      }
      
      // Target all Blockly flyout elements
      const flyoutElements = document.querySelectorAll(
        '.blocklyFlyout, .blocklyFlyoutBackground, .blocklyToolboxDiv'
      );
      
      if (flyoutElements.length > 0) {
        flyoutElements.forEach(el => {
          if (el) {
            // Force visibility with !important using style property
            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('pointer-events', 'auto', 'important');
          }
        });
        
        // Also fix categories to make them more clearly clickable
        const categories = document.querySelectorAll('.blocklyTreeRow');
        categories.forEach(cat => {
          if (cat && !cat.hasAttribute('fixed-style')) {
            cat.style.setProperty('cursor', 'pointer', 'important');
            cat.style.setProperty('padding', '6px', 'important');
            cat.setAttribute('fixed-style', 'true');
          }
        });
      }
    }
    
    // Run fix with different timing patterns
    function setupFixSchedule() {
      // Initial fixes at staggered intervals after page load
      [100, 500, 1000, 2000, 5000].forEach(delay => {
        setTimeout(keepFlyoutVisible, delay);
      });
      
      // Regular interval for ongoing monitoring
      // Use a conservative interval to avoid performance issues
      const fixInterval = setInterval(keepFlyoutVisible, 2000);
      
      // Run fix on any click anywhere in document
      document.addEventListener('click', function() {
        // Apply fixes at staggered intervals after clicks
        [10, 100, 300, 500].forEach(delay => {
          setTimeout(keepFlyoutVisible, delay);
        });
      });
      
      // Clean up when page unloads
      window.addEventListener('beforeunload', function() {
        clearInterval(fixInterval);
      });
    }
    
    // Apply CSS fixes directly
    function applyCssFixes() {
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
          min-width: 180px !important;
        }
        
        /* Make categories more obviously clickable */
        .blocklyTreeRow {
          cursor: pointer !important;
          padding: 6px !important;
          margin-bottom: 2px !important;
        }
        
        /* Highlight selected category */
        .blocklyTreeSelected {
          background-color: rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Highlight category on hover */
        .blocklyTreeRow:hover {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Initialize all fixes
    function initialize() {
      // Apply CSS fixes first
      applyCssFixes();
      
      // Then set up the scheduled fixes
      setupFixSchedule();
      
      console.log('Blockly flyout fix initialized');
    }
    
    // Start fixes when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      // DOM is already ready
      initialize();
    }
  })();