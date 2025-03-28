import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './blockImports';
import ErrorBoundary from './ErrorBoundary';
import { forceGarbageCollectionHint } from './memoryUtils';

// Make memory utility accessible globally
window.forceGarbageCollectionHint = forceGarbageCollectionHint;

// Global error handler
window.addEventListener('error', function(event) {
  console.error('Unhandled error:', event.error);
  
  // Try to free memory
  if (typeof window.forceGarbageCollectionHint === 'function') {
    window.forceGarbageCollectionHint();
  }
});

// Detect memory issues
if (window.performance && window.performance.memory) {
  setInterval(() => {
    const memUsed = window.performance.memory.usedJSHeapSize;
    const memLimit = window.performance.memory.jsHeapSizeLimit;
    
    // If using more than 80% of available memory, warn in console
    if (memUsed > memLimit * 0.8) {
      console.warn('High memory usage detected:', 
        Math.round(memUsed/1048576) + 'MB', 
        'of', 
        Math.round(memLimit/1048576) + 'MB'
      );
    }
  }, 30000); // Check every 30 seconds
}

// Add recovery function globally
window.recoverApplication = function() {
  try {
    console.log("Starting application recovery...");
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Set recovery flag
    sessionStorage.setItem('recovered', 'true');
    
    // Show message
    alert('Application has been reset. The page will now reload.');
    
    // Reload page
    window.location.reload();
  } catch (e) {
    console.error('Error during recovery:', e);
    alert('Could not reset application. Please refresh the page manually.');
  }
};

// Error count for auto-recovery
let errorCount = 0;
const MAX_ERRORS_BEFORE_RECOVERY = 3;
let lastErrorTime = 0;

// Enhanced error tracking
window.addEventListener('error', function(event) {
  const now = Date.now();
  
  // Reset error count if more than 10 seconds between errors
  if (now - lastErrorTime > 10000) {
    errorCount = 0;
  }
  
  errorCount++;
  lastErrorTime = now;
  
  console.error(`Application error (${errorCount}/${MAX_ERRORS_BEFORE_RECOVERY}):`, event.error);
  
  // Auto-recovery after multiple errors in quick succession
  if (errorCount >= MAX_ERRORS_BEFORE_RECOVERY) {
    console.warn('Multiple errors detected. Attempting automatic recovery...');
    setTimeout(window.recoverApplication, 1000);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);