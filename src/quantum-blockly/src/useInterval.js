import { useEffect, useRef } from 'react';

/**
 * Custom React hook for safely using setInterval
 * Prevents memory leaks and stack overflow issues
 * 
 * @param {Function} callback - Function to call on each interval
 * @param {number} delay - Delay in milliseconds (null to pause)
 */
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if delay is null
    if (delay === null) return;
    
    function tick() {
      savedCallback.current();
    }
    
    const id = setInterval(tick, delay);
    
    // Clear interval on unmount or delay change
    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;