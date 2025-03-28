// src/QuantumTutorial.js
import React, { useState } from 'react';
import './QuantumTutorial.css';

const QuantumTutorial = ({ onExampleLoad }) => {
  const [activeTutorial, setActiveTutorial] = useState(0);
  const [expanded, setExpanded] = useState(true);

  // Tutorial content organized by levels
  const tutorials = [
    {
      id: 'intro',
      title: 'Introduction to Quantum Tic-Tac-Toe',
      level: 'Beginner',
      content: (
        <>
          <p>
            Welcome to Quantum Tic-Tac-Toe! This game uses quantum computing concepts to make decisions about where to place game pieces.
          </p>
          <p>
            <strong>How it works:</strong> Instead of following step-by-step rules like regular computers, quantum computers can explore many possibilities at once to find the best solution.
          </p>
          <p>
            In our game, we assign <strong>weights</strong> to each empty spot on the board. Higher weights mean better spots to play. The quantum computer chooses the spot with the highest weight!
          </p>
          <div className="tutorial-image">
            <div className="tic-tac-toe-board">
              <div className="tutorial-row">
                <div className="tutorial-cell corner">7</div>
                <div className="tutorial-cell edge">5</div>
                <div className="tutorial-cell corner">7</div>
              </div>
              <div className="tutorial-row">
                <div className="tutorial-cell edge">5</div>
                <div className="tutorial-cell center">9</div>
                <div className="tutorial-cell edge">5</div>
              </div>
              <div className="tutorial-row">
                <div className="tutorial-cell corner">7</div>
                <div className="tutorial-cell edge">5</div>
                <div className="tutorial-cell corner">7</div>
              </div>
            </div>
            <p className="tutorial-caption">In this example, the center (weight 9) is the best move!</p>
          </div>
          <button className="tutorial-action-button" onClick={() => onExampleLoad('simple_strategy')}>
            Try Simple Strategy
          </button>
        </>
      )
    },
    {
      id: 'basic-strategy',
      title: 'Creating Basic Strategies',
      level: 'Beginner',
      content: (
        <>
          <p>
            The most basic strategy for Tic-Tac-Toe is to give different weights to different positions on the board.
          </p>
          <ul>
            <li><strong>Center (9):</strong> Usually the strongest position</li>
            <li><strong>Corners (7):</strong> Good strategic positions</li>
            <li><strong>Edges (5):</strong> Less valuable positions</li>
          </ul>
          <p>
            By assigning these weights, you're telling the quantum computer which positions are most valuable. The computer will try to pick the position with the highest weight that's still available.
          </p>
          <div className="code-example">
            <pre>
{`// Simple position-based strategy
function createQuboForSingleMove(board) {
  // Give weights to positions:
  // Center = 9 (best)
  // Corners = 7 (good)
  // Edges = 5 (okay)
}`}
            </pre>
          </div>
          <p>
            Try this strategy using the "Simple Strategy" block in the toolbox!
          </p>
          <button className="tutorial-action-button" onClick={() => onExampleLoad('simple_strategy')}>
            Try Simple Strategy
          </button>
        </>
      )
    },
    {
      id: 'smart-strategy',
      title: 'Smart Strategies: Wins & Blocks',
      level: 'Intermediate',
      content: (
        <>
          <p>
            A smarter strategy checks for potential winning moves and blocks your opponent from winning.
          </p>
          <p>
            <strong>Key concepts:</strong>
          </p>
          <ul>
            <li><strong>Win Detection:</strong> If you can make a move to get three in a row, do it!</li>
            <li><strong>Block Detection:</strong> If your opponent has two in a row, block their third spot!</li>
            <li><strong>Position Values:</strong> Still use position-based weights as a fallback</li>
          </ul>
          <div className="tutorial-image">
            <div className="tic-tac-toe-board">
              <div className="tutorial-row">
                <div className="tutorial-cell">X</div>
                <div className="tutorial-cell">X</div>
                <div className="tutorial-cell winning-move">?</div>
              </div>
              <div className="tutorial-row">
                <div className="tutorial-cell">O</div>
                <div className="tutorial-cell center">O</div>
                <div className="tutorial-cell">-</div>
              </div>
              <div className="tutorial-row">
                <div className="tutorial-cell">-</div>
                <div className="tutorial-cell">-</div>
                <div className="tutorial-cell">-</div>
              </div>
            </div>
            <p className="tutorial-caption">Win detection would assign a high weight (like 20) to the top-right position!</p>
          </div>
          <button className="tutorial-action-button" onClick={() => onExampleLoad('win_detection_strategy')}>
            Try Win Detection Strategy
          </button>
        </>
      )
    },
    {
      id: 'quantum-concepts',
      title: 'Quantum Computing Concepts',
      level: 'Advanced',
      content: (
        <>
          <p>
            Quantum computers work differently than classical computers. Here are some key concepts:
          </p>
          <div className="quantum-concept">
            <h4>Quantum Superposition</h4>
            <p>
              In quantum computing, a qubit (quantum bit) can be in multiple states at once, unlike a classical bit that can only be 0 or 1. This is called <strong>superposition</strong>.
            </p>
            <p>
              In our game, this would be like considering all possible board positions simultaneously!
            </p>
          </div>
          <div className="quantum-concept">
            <h4>Quantum Annealing</h4>
            <p>
              The quantum computer finds the best solution through a process called <strong>quantum annealing</strong>, gradually narrowing down from all possibilities to the optimal one.
            </p>
            <p>
              For Tic-Tac-Toe, the quantum computer finds the position with the highest weight by exploring all options simultaneously and settling on the best one.
            </p>
          </div>
          <div className="quantum-concept">
            <h4>QUBO (Quadratic Unconstrained Binary Optimization)</h4>
            <p>
              This is the mathematical format we use to tell the quantum computer our problem. In simpler terms:
            </p>
            <ul>
              <li>We turn each board position into a yes/no question</li>
              <li>We assign weights to each position</li>
              <li>We ensure only one position is chosen</li>
            </ul>
          </div>
          <p>
            The blocks you use in this app are building QUBO problems behind the scenes, which the quantum computer can solve!
          </p>
          <button className="tutorial-action-button" onClick={() => onExampleLoad('complete_strategy')}>
            Try Advanced Strategy
          </button>
        </>
      )
    },
    {
      id: 'challenge',
      title: 'Student Challenges',
      level: 'All Levels',
      content: (
        <>
          <p>
            Ready to test your quantum Tic-Tac-Toe skills? Try these challenges!
          </p>
          <div className="challenge-list">
            <div className="challenge-item">
              <h4>Challenge 1: Unbeatable Center</h4>
              <p>
                Create a strategy that always takes the center if it's available, and corners otherwise.
              </p>
              <button className="challenge-button" onClick={() => onExampleLoad('simple_strategy')}>
                Start Challenge
              </button>
            </div>
            <div className="challenge-item">
              <h4>Challenge 2: Win Detector</h4>
              <p>
                Create a strategy that can detect and make winning moves. Test it against the CPU!
              </p>
              <button className="challenge-button" onClick={() => onExampleLoad('win_detection_strategy')}>
                Start Challenge
              </button>
            </div>
            <div className="challenge-item">
              <h4>Challenge 3: Custom Weights</h4>
              <p>
                Experiment with different weights for different positions to find the best strategy.
              </p>
              <button className="challenge-button" onClick={() => onExampleLoad('quantum_strategy_builder')}>
                Start Challenge
              </button>
            </div>
            <div className="challenge-item">
              <h4>Challenge 4: Beat the Hard CPU</h4>
              <p>
                Can your quantum strategy beat the hard difficulty CPU? Use everything you've learned!
              </p>
              <button className="challenge-button" onClick={() => onExampleLoad('complete_strategy')}>
                Start Challenge
              </button>
            </div>
          </div>
        </>
      )
    }
  ];

  // Function to navigate between tutorials
  const handleTutorialChange = (index) => {
    setActiveTutorial(index);
  };

  // Toggle tutorial expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="quantum-tutorial-container">
      <div className="tutorial-header">
        <h2>📚 Quantum Tic-Tac-Toe Tutorials</h2>
        <button className="toggle-button" onClick={toggleExpanded}>
          {expanded ? 'Hide Tutorials' : 'Show Tutorials'}
        </button>
      </div>

      {expanded && (
        <div className="tutorial-content">
          <div className="tutorial-tabs">
            {tutorials.map((tutorial, index) => (
              <button
                key={tutorial.id}
                className={`tutorial-tab ${activeTutorial === index ? 'active' : ''} ${tutorial.level.toLowerCase()}`}
                onClick={() => handleTutorialChange(index)}
              >
                {tutorial.title}
                <span className="level-badge">{tutorial.level}</span>
              </button>
            ))}
          </div>

          <div className="tutorial-body">
            <h3>{tutorials[activeTutorial].title}</h3>
            <div className="tutorial-level">
              Level: <span className={`level ${tutorials[activeTutorial].level.toLowerCase()}`}>
                {tutorials[activeTutorial].level}
              </span>
            </div>
            {tutorials[activeTutorial].content}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumTutorial;