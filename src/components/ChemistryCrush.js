import React, { useState, useEffect } from 'react';
import './ChemistryCrush.css'; // We'll create this CSS file separately

// Icons replacement (simple version without lucide-react)
const Icons = {
  X: () => <span className="icon">✕</span>,
  RefreshCw: () => <span className="icon">↻</span>,
  Info: () => <span className="icon">ℹ</span>,
  ChevronRight: () => <span className="icon">→</span>,
  ChevronLeft: () => <span className="icon">←</span>,
  AlertTriangle: () => <span className="icon">⚠</span>,
};

const ChemistryCrush = () => {
  // Game states
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [targetScore, setTargetScore] = useState(300);
  const [moves, setMoves] = useState(10);
  const [gameBoard, setGameBoard] = useState([]);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [completedCompounds, setCompletedCompounds] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showElementCount, setShowElementCount] = useState({});
  const [compoundHistory, setCompoundHistory] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [correctTries, setCorrectTries] = useState(0);
  const [incorrectTries, setIncorrectTries] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Level definitions
  const levels = [
    {
      id: 1,
      elements: ['H', 'O'],
      targets: [
        { formula: 'H₂O', atoms: [{ element: 'H', count: 2 }, { element: 'O', count: 1 }] }
      ],
      description: "Water - Ratio of hydrogen to oxygen is 2:1",
      ratioExplanation: "In water (H₂O), for every 1 oxygen atom, you need 2 hydrogen atoms. This 2:1 ratio is essential for forming the water molecule.",
      targetScore: 300,
      pointsPerCompound: 100,
      moves: 10
    },
    {
      id: 2,
      elements: ['H', 'O'],
      targets: [
        { formula: 'H₂O₂', atoms: [{ element: 'H', count: 2 }, { element: 'O', count: 2 }] }
      ],
      description: "Hydrogen Peroxide - Ratio of hydrogen to oxygen is 2:2 or 1:1",
      ratioExplanation: "Hydrogen peroxide (H₂O₂) has a 1:1 ratio of hydrogen to oxygen atoms. Compare this to water (H₂O) which has a 2:1 ratio.",
      targetScore: 400,
      pointsPerCompound: 100,
      moves: 9
    },
    {
      id: 3,
      elements: ['C', 'O'],
      targets: [
        { formula: 'CO₂', atoms: [{ element: 'C', count: 1 }, { element: 'O', count: 2 }] }
      ],
      description: "Carbon Dioxide - Ratio of carbon to oxygen is 1:2",
      ratioExplanation: "In CO₂, the ratio of carbon to oxygen is 1:2. This means for every carbon atom, you need twice as many oxygen atoms.",
      targetScore: 400,
      pointsPerCompound: 100,
      moves: 8
    },
    {
      id: 4,
      elements: ['C', 'O'],
      targets: [
        { formula: 'CO', atoms: [{ element: 'C', count: 1 }, { element: 'O', count: 1 }] }
      ],
      description: "Carbon Monoxide - Ratio of carbon to oxygen is 1:1",
      ratioExplanation: "In CO, the ratio is 1:1 - equal numbers of carbon and oxygen atoms. Compare this with CO₂ which has a 1:2 ratio.",
      targetScore: 400,
      pointsPerCompound: 100,
      moves: 8
    },
    {
      id: 5,
      elements: ['N', 'H'],
      targets: [
        { formula: 'NH₃', atoms: [{ element: 'N', count: 1 }, { element: 'H', count: 3 }] }
      ],
      description: "Ammonia - Ratio of nitrogen to hydrogen is 1:3",
      ratioExplanation: "Ammonia (NH₃) has a ratio of 1:3 between nitrogen and hydrogen. For every nitrogen atom, you need three hydrogen atoms.",
      targetScore: 500,
      pointsPerCompound: 100,
      moves: 7
    },
    {
      id: 6,
      elements: ['C', 'H'],
      targets: [
        { formula: 'CH₄', atoms: [{ element: 'C', count: 1 }, { element: 'H', count: 4 }] }
      ],
      description: "Methane - Ratio of carbon to hydrogen is 1:4",
      ratioExplanation: "In methane (CH₄), the ratio of carbon to hydrogen is 1:4. This means one carbon atom combines with four hydrogen atoms.",
      targetScore: 500,
      pointsPerCompound: 100,
      moves: 7
    },
    {
      id: 7,
      elements: ['C', 'H', 'O'],
      targets: [
        { formula: 'C₂H₅OH', atoms: [{ element: 'C', count: 2 }, { element: 'H', count: 6 }, { element: 'O', count: 1 }] }
      ],
      description: "Ethanol - Ratio of C:H:O is 2:6:1",
      ratioExplanation: "Ethanol (C₂H₅OH) has a ratio of 2:6:1 for carbon:hydrogen:oxygen. Note how the ratios become more complex with three elements.",
      targetScore: 600,
      pointsPerCompound: 150,
      moves: 6
    },
    {
      id: 8,
      elements: ['C', 'H', 'O'],
      targets: [
        { formula: 'C₆H₁₂O₆', atoms: [{ element: 'C', count: 6 }, { element: 'H', count: 12 }, { element: 'O', count: 6 }] }
      ],
      description: "Glucose - Ratio of C:H:O is 6:12:6 or 1:2:1",
      ratioExplanation: "Glucose (C₆H₁₂O₆) has a ratio of 6:12:6 which simplifies to 1:2:1. This shows that equivalent ratios can be expressed in simplified form.",
      targetScore: 600,
      pointsPerCompound: 200,
      moves: 5
    }
  ];

  // Element colors and atomic weights (for educational purposes)
  const elementInfo = {
    'H': { color: '#3498db', name: 'Hydrogen', weight: 1.008 },   // Blue
    'O': { color: '#e74c3c', name: 'Oxygen', weight: 16.0 },      // Red
    'C': { color: '#2c3e50', name: 'Carbon', weight: 12.01 },     // Dark Blue/Black
    'N': { color: '#9b59b6', name: 'Nitrogen', weight: 14.01 },   // Purple
    'S': { color: '#f1c40f', name: 'Sulfur', weight: 32.06 },     // Yellow
    'P': { color: '#e67e22', name: 'Phosphorus', weight: 30.97 }, // Orange
    'Cl': { color: '#2ecc71', name: 'Chlorine', weight: 35.45 },  // Green
  };

  // Initialize the game board
  useEffect(() => {
    resetLevel(currentLevel);
  }, [currentLevel]);

  // Hide feedback after 3 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  // Create a new game board for the current level
  const resetLevel = (levelNum) => {
    const level = levels.find(l => l.id === levelNum) || levels[0];
    
    // Reset game state
    setMoves(level.moves);
    setSelectedAtoms([]);
    setCompletedCompounds(0);
    setCompoundHistory([]);
    setScore(0);
    setTargetScore(level.targetScore);
    setGameStatus('playing');
    setShowElementCount({});
    setShowFeedback(false);
    setFeedbackMessage('');
    
    // Set available compounds for this level
    setCompounds(level.targets);
    
    // Create the board
    const elements = level.elements;
    const newBoard = [];
    
    // Create a 6x6 board with a balanced distribution of elements
    for (let row = 0; row < 6; row++) {
      const newRow = [];
      for (let col = 0; col < 6; col++) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        newRow.push({
          element: randomElement,
          row,
          col,
          id: `${row}-${col}`
        });
      }
      newBoard.push(newRow);
    }
    
    setGameBoard(newBoard);
  };

  // Handle atom selection
  const handleAtomClick = (atom) => {
    if (gameStatus !== 'playing' || moves <= 0) return;
    
    // Add or remove from selection
    const isSelected = selectedAtoms.some(a => a.id === atom.id);
    
    let newSelectedAtoms;
    if (isSelected) {
      newSelectedAtoms = selectedAtoms.filter(a => a.id !== atom.id);
    } else {
      newSelectedAtoms = [...selectedAtoms, atom];
    }
    
    setSelectedAtoms(newSelectedAtoms);
    
    // Update element count display
    updateElementCount(newSelectedAtoms);
  };

  // Update the count of each element selected
  const updateElementCount = (atoms) => {
    const counts = {};
    atoms.forEach(atom => {
      counts[atom.element] = (counts[atom.element] || 0) + 1;
    });
    setShowElementCount(counts);
  };

  // Check if selected atoms form a valid compound
  const checkCompound = () => {
    if (selectedAtoms.length === 0 || moves <= 0) return;
    
    // Count elements
    const elementCounts = {};
    selectedAtoms.forEach(atom => {
      elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1;
    });
    
    // Check against level targets
    const currentLevelObj = levels.find(l => l.id === currentLevel);
    let compoundFound = false;
    
    currentLevelObj.targets.forEach(target => {
      // Check if all required elements are present in correct amounts
      const isMatch = target.atoms.every(atom => 
        elementCounts[atom.element] === atom.count
      );
      
      // Check if there are no extra elements beyond what's needed
      const noExtraElements = Object.keys(elementCounts).length === target.atoms.length &&
                             target.atoms.every(atom => Object.keys(elementCounts).includes(atom.element));
      
      if (isMatch && noExtraElements) {
        compoundFound = true;
        
        // Add to compound history
        setCompoundHistory([...compoundHistory, target.formula]);
        
        // Increment compound counter
        setCompletedCompounds(completedCompounds + 1);
        
        // Add points
        const newScore = score + currentLevelObj.pointsPerCompound;
        setScore(newScore);
        setTotalScore(totalScore + currentLevelObj.pointsPerCompound);
        
        // Increment correct tries
        setCorrectTries(correctTries + 1);
        
        // Replace selected atoms with new random ones
        const newBoard = [...gameBoard];
        selectedAtoms.forEach(atom => {
          const level = levels.find(l => l.id === currentLevel);
          const randomElement = level.elements[Math.floor(Math.random() * level.elements.length)];
          newBoard[atom.row][atom.col] = {
            ...newBoard[atom.row][atom.col],
            element: randomElement
          };
        });
        
        setGameBoard(newBoard);
        
        // Show positive feedback
        setFeedbackMessage(`Correct! You formed ${target.formula}`);
        setShowFeedback(true);
        
        // Check if target score has been reached
        if (newScore >= targetScore) {
          setGameStatus('won');
        }
      }
    });
    
    // If no valid compound was found, show feedback
    if (!compoundFound) {
      // Increment incorrect tries
      setIncorrectTries(incorrectTries + 1);
      
      // Show negative feedback
      setFeedbackMessage("Incorrect compound! Check your ratios");
      setShowFeedback(true);
    }
    
    // Use a move regardless of success
    setMoves(moves - 1);
    setSelectedAtoms([]);
    setShowElementCount({});
    
    // Check loss condition
    if (moves <= 1 && !compoundFound && score < targetScore) {
      setGameStatus('lost');
    }
    
    return compoundFound;
  };

  // Handle going to next level
  const nextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel(currentLevel + 1);
    } else if (currentLevel === levels.length && gameStatus === 'won') {
      // Game completed - all levels finished
      setGameCompleted(true);
    }
  };

  // Handle going to previous level
  const prevLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  // Reset the whole game
  const resetGame = () => {
    setCurrentLevel(1);
    setTotalScore(0);
    setCorrectTries(0);
    setIncorrectTries(0);
    setGameCompleted(false);
    resetLevel(1);
  };

  // Render atom on the game board
  const renderAtom = (atom) => {
    const isSelected = selectedAtoms.some(a => a.id === atom.id);
    const elementData = elementInfo[atom.element] || { color: '#777', name: atom.element, weight: 0 };
    
    return (
      <div 
        key={atom.id}
        className={`atom ${isSelected ? 'selected' : ''}`}
        style={{ backgroundColor: elementData.color }}
        onClick={() => handleAtomClick(atom)}
        title={`${elementData.name} (${atom.element})`}
      >
        {atom.element}
      </div>
    );
  };

  // Render the tutorial
  const renderTutorial = () => {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Welcome to Chemistry Crush!</h2>
            <button 
              className="close-button"
              onClick={() => setShowTutorial(false)}
            >
              <Icons.X />
            </button>
          </div>
          
          <div className="modal-content">
            <p className="section-heading">Learn about chemical ratios by creating compounds!</p>
            
            <div className="tutorial-section">
              <p className="section-title">How to Play:</p>
              <ol>
                <li>Click on atoms to select them</li>
                <li>Pay attention to the ratio display as you select</li>
                <li>Form compounds by selecting atoms in the correct ratio</li>
                <li>Click "Form Compound" to check your selection</li>
              </ol>
            </div>
            
            <div className="example-section">
              <p className="section-title">Example: Water (H₂O)</p>
              <div className="example-atoms">
                <div className="example-atom" style={{ backgroundColor: elementInfo['H'].color }}>H</div>
                <div className="example-atom" style={{ backgroundColor: elementInfo['H'].color }}>H</div>
                <div className="example-atom" style={{ backgroundColor: elementInfo['O'].color }}>O</div>
                <span className="equals">=</span>
                <div className="compound">H₂O</div>
              </div>
              <p className="example-ratio">Ratio: 2 hydrogen atoms : 1 oxygen atom (2:1)</p>
            </div>
          </div>
          
          <button 
            className="start-button"
            onClick={() => setShowTutorial(false)}
          >
            Start Learning!
          </button>
        </div>
      </div>
    );
  };

  // Render game over message
  const renderGameOver = () => {
    const currentLevelObj = levels.find(l => l.id === currentLevel);
    
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2 className="result-title">
            {gameStatus === 'won' ? 'Level Complete!' : 'Try Again'}
          </h2>
          
          {gameStatus === 'won' ? (
            <div className="result-content">
              <p>You reached the target score by creating {completedCompounds} compounds!</p>
              
              <div className="info-box">
                <p className="info-title">Ratio Explanation:</p>
                <p>{currentLevelObj.ratioExplanation}</p>
              </div>
              
              <div className="info-box">
                <p className="info-title">Compounds Created:</p>
                <div className="compound-list">
                  {compoundHistory.map((formula, idx) => (
                    <span key={idx} className="compound-tag">
                      {formula}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="score">Level Score: {score}/{targetScore}</p>
              <p className="total-score">Total Score: {totalScore}</p>
            </div>
          ) : (
            <div className="result-content">
              <p>You ran out of moves before reaching the target score.</p>
              <p>Remember the ratio: {currentLevelObj.description.split('-')[1].trim()}</p>
              <p>You created {completedCompounds} {currentLevelObj.targets[0].formula} compounds.</p>
              <p className="score">Level Score: {score}/{targetScore}</p>
              <p className="total-score">Total Score: {totalScore}</p>
            </div>
          )}
          
          <div className="button-row">
            <button 
              className="game-button retry-button"
              onClick={() => resetLevel(currentLevel)}
            >
              <Icons.RefreshCw /> Try Again
            </button>
            
            {gameStatus === 'won' && currentLevel < levels.length && (
              <button 
                className="game-button next-button"
                onClick={nextLevel}
              >
                Next Level <Icons.ChevronRight />
              </button>
            )}
            
            {gameStatus === 'won' && currentLevel === levels.length && (
              <button 
                className="game-button next-button"
                onClick={nextLevel}
              >
                Complete Game <Icons.ChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render game completion screen
  const renderGameCompletion = () => {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2 className="result-title">Game Complete!</h2>
          
          <div className="result-content">
            <div className="trophy-icon">🏆</div>
            <p className="congratulations">Congratulations! You've completed all levels!</p>
            
            <div className="final-stats">
              <h3>Your Final Results:</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-label">Total Score</p>
                  <p className="stat-value">{totalScore}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Correct Tries</p>
                  <p className="stat-value">{correctTries}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Incorrect Tries</p>
                  <p className="stat-value">{incorrectTries}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-label">Accuracy</p>
                  <p className="stat-value">
                    {Math.round((correctTries / (correctTries + incorrectTries)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            <p className="mastery-message">
              You've mastered the basics of chemical ratios and compounds!
            </p>
          </div>
          
          <div className="button-row">
            <button 
              className="game-button play-again-button"
              onClick={resetGame}
            >
              <Icons.RefreshCw /> Play Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render ratio display for selected atoms
  const renderRatioDisplay = () => {
    if (Object.keys(showElementCount).length < 2) return null;
    
    const elementsArray = Object.entries(showElementCount);
    
    return (
      <div className="ratio-display">
        <p className="ratio-title">Current Ratio:</p>
        <div className="ratio-values">
          {elementsArray.map(([element, count], idx) => (
            <React.Fragment key={element}>
              <span className="ratio-element">
                <div 
                  className="small-atom"
                  style={{ backgroundColor: elementInfo[element]?.color || '#777' }}
                >
                  {element}
                </div>
                <span className="element-count">{count}</span>
              </span>
              {idx < elementsArray.length - 1 && <span className="ratio-separator">:</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render feedback message
  const renderFeedback = () => {
    if (!showFeedback) return null;
    
    const isCorrect = feedbackMessage.startsWith('Correct');
    
    return (
      <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
        {isCorrect ? '✓ ' : <Icons.AlertTriangle />} {feedbackMessage}
      </div>
    );
  };

  return (
    <div className="game-container">
      {/* Game Header */}
      <div className="game-header">
        <div className="header-bar">
          <div className="title-section">
            <h1 className="game-title">Chemistry Crush</h1>
            <button 
              className="info-button"
              onClick={() => setShowTutorial(true)}
            >
              <Icons.Info />
            </button>
          </div>
          <div className="level-indicator">Level {currentLevel}</div>
        </div>
        
        <div className="game-info">
          <div className="stats">
            <div className="stat-item">
              Level Score: <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              Total Score: <span className="stat-value">{totalScore}</span>
            </div>
            <div className="stat-item">
              Moves: <span className="stat-value">{moves}</span>
            </div>
          </div>
          
          {/* Target Compound and Score */}
          <div className="target-box">
            <div className="target-header">
              <p className="target-label">Target Compound:</p>
              <p className="target-score">
                Score: <span>{score}/{targetScore}</span>
              </p>
            </div>
            <div className="target-info">
              <div className="compound-formula">
                {compounds[0]?.formula}
              </div>
              <div className="compound-description">
                {levels[currentLevel-1]?.description}
              </div>
            </div>
          </div>
          
          {/* Compound Counter */}
          <div className="progress-box">
            <div className="progress-header">
              <p className="progress-label">Compounds Created:</p>
              <div className="progress-count">
                <span className="count-value">{completedCompounds}</span>
                <span className="count-label">× {compounds[0]?.formula}</span>
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Ratio Display */}
          {Object.keys(showElementCount).length > 0 && renderRatioDisplay()}
          
          {/* Feedback Message */}
          {renderFeedback()}
        </div>
      </div>
      
      {/* Game Board */}
      <div className="board-container">
        <div className="game-board">
          {gameBoard.flat().map(atom => renderAtom(atom))}
        </div>
        
        {/* Selected Atoms Display */}
        <div className="selection-display">
          {selectedAtoms.length > 0 ? (
            <div className="selected-atoms">
              {selectedAtoms.map((atom, idx) => (
                <React.Fragment key={atom.id}>
                  <div 
                    className="selected-atom"
                    style={{ backgroundColor: elementInfo[atom.element]?.color || '#777' }}
                  >
                    {atom.element}
                  </div>
                  {idx < selectedAtoms.length - 1 && <span className="plus-sign">+</span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="selection-hint">Select atoms to create compounds</p>
          )}
        </div>
        
        {/* Educational Hint */}
        {selectedAtoms.length > 0 && (
          <div className="hint-box">
            <p className="hint-title">Remember:</p>
            <p className="hint-text">The right ratio of atoms is key to forming a compound correctly.</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className={`clear-button ${selectedAtoms.length === 0 ? 'disabled' : ''}`}
            onClick={() => {
              setSelectedAtoms([]);
              setShowElementCount({});
            }}
            disabled={selectedAtoms.length === 0}
          >
            Clear Selection
          </button>
          
          <button 
            className={`form-button ${selectedAtoms.length === 0 ? 'disabled' : ''}`}
            onClick={checkCompound}
            disabled={selectedAtoms.length === 0}
          >
            Form Compound
          </button>
        </div>
      </div>
      
      {/* Level Navigation */}
      <div className="level-navigation">
        <button 
          className={`nav-button prev-button ${currentLevel <= 1 ? 'disabled' : ''}`}
          onClick={prevLevel}
          disabled={currentLevel <= 1}
        >
          <Icons.ChevronLeft /> Previous Level
        </button>
        
        <button 
          className="nav-button restart-button"
          onClick={() => resetLevel(currentLevel)}
        >
          <Icons.RefreshCw /> Restart
        </button>
        
        <button 
          className={`nav-button next-button ${currentLevel >= levels.length ? 'disabled' : ''}`}
          onClick={nextLevel}
          disabled={currentLevel >= levels.length || gameStatus !== 'won'}
        >
          Next Level <Icons.ChevronRight />
        </button>
      </div>
      
      {/* Tutorial */}
      {showTutorial && renderTutorial()}
      
      {/* Game Over Screen */}
      {gameStatus !== 'playing' && !gameCompleted && renderGameOver()}
      
      {/* Game Completion Screen */}
      {gameCompleted && renderGameCompletion()}
    </div>
  );
};

export default ChemistryCrush;