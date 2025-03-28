// Save this as public/blockly-fix.js

(function() {
    // Keep checking for the sidebar and force it to stay open
    function forceBlocklyFlyoutVisible() {
      const flyouts = document.querySelectorAll('.blocklyFlyout');
      flyouts.forEach(flyout => {
        if (flyout) {
          flyout.style.display = 'block';
          flyout.style.visibility = 'visible';
          flyout.style.opacity = '1';
        }
      });
    }
  
    // Apply fix after DOM loads
    function applyFixWhenReady() {
      // Run every 500ms
      setInterval(forceBlocklyFlyoutVisible, 500);
    }
  
    // Run when loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyFixWhenReady);
    } else {
      applyFixWhenReady();
    }
  })();