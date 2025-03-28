import React, { Component } from 'react';
import { forceGarbageCollectionHint } from './memoryUtils';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Try to clean up memory
    forceGarbageCollectionHint();
  }

  handleReset = () => {
    // Clear local and session storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Force garbage collection hint
      forceGarbageCollectionHint();
      
      // Reset error state
      this.setState({ hasError: false, error: null, errorInfo: null });
      
      // Reload the page
      window.location.reload();
    } catch (resetError) {
      console.error("Error during reset:", resetError);
      // If resetting fails, offer to hard reload
      if (window.confirm("Could not reset application state. Perform a hard reload?")) {
        window.location.href = window.location.pathname;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffeeba',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#856404' }}>Something went wrong</h2>
          <p>The application encountered an error and couldn't continue.</p>
          
          {this.state.error && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px',
              textAlign: 'left',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <p><strong>Error:</strong> {this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details>
                  <summary>See component stack</summary>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={this.handleReset}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Reset Application
            </button>
          </div>
          
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            This will clear application data and reload the page.
          </p>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;