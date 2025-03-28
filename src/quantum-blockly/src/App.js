import React from 'react';
import './App.css';
import BlocklyComponent from './BlocklyComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockly React Integration</h1>
      </header>
      <main>
        <BlocklyComponent />
      </main>
    </div>
  );
}

export default App;