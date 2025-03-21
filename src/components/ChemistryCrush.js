import React, { useState, useEffect } from 'react';

// Icons replacement using simple spans
const Icons = {
  X: () => <span className="icon">✕</span>,
  RefreshCw: () => <span className="icon">↻</span>,
  Info: () => <span className="icon">ℹ</span>,
  ChevronRight: () => <span className="icon">→</span>,
  ChevronLeft: () => <span className="icon">←</span>,
  AlertTriangle: () => <span className="icon">⚠</span>,
  Flask: () => <span className="icon">⚗️</span>,
  Lab: () => <span className="icon">🧪</span>
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
  const [connections, setConnections] = useState([]);
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

  // Element colors and atomic weights (enhanced with gradients and textures)
  const elementInfo = {
    'H': { 
      color: 'linear-gradient(135deg, #3498db, #2980b9)', 
      bgStyle: 'radial-gradient(circle, #3498db, #2980b9)',
      name: 'Hydrogen', 
      weight: 1.008,
      symbol: 'H',
      borderColor: '#2573a7'
    },
    'O': { 
      color: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
      bgStyle: 'radial-gradient(circle, #e74c3c, #c0392b)', 
      name: 'Oxygen', 
      weight: 16.0,
      symbol: 'O',
      borderColor: '#a33025'
    },
    'C': { 
      color: 'linear-gradient(135deg, #2c3e50, #1a2530)', 
      bgStyle: 'radial-gradient(circle, #2c3e50, #1a2530)', 
      name: 'Carbon', 
      weight: 12.01,
      symbol: 'C',
      borderColor: '#0f1a24'
    },
    'N': { 
      color: 'linear-gradient(135deg, #9b59b6, #8e44ad)', 
      bgStyle: 'radial-gradient(circle, #9b59b6, #8e44ad)', 
      name: 'Nitrogen', 
      weight: 14.01,
      symbol: 'N',
      borderColor: '#7d399b'
    },
    'S': { 
      color: 'linear-gradient(135deg, #f1c40f, #d4ac0d)', 
      bgStyle: 'radial-gradient(circle, #f1c40f, #d4ac0d)', 
      name: 'Sulfur', 
      weight: 32.06,
      symbol: 'S',
      borderColor: '#b7950b'
    },
    'P': { 
      color: 'linear-gradient(135deg, #e67e22, #d35400)', 
      bgStyle: 'radial-gradient(circle, #e67e22, #d35400)', 
      name: 'Phosphorus', 
      weight: 30.97,
      symbol: 'P',
      borderColor: '#b04700'
    },
    'Cl': { 
      color: 'linear-gradient(135deg, #2ecc71, #27ae60)', 
      bgStyle: 'radial-gradient(circle, #2ecc71, #27ae60)', 
      name: 'Chlorine', 
      weight: 35.45,
      symbol: 'Cl',
      borderColor: '#219652'
    }
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
    setConnections([]);
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

  // Check if two atoms are adjacent (horizontally, vertically, or diagonally)
  const areAtomsAdjacent = (atom1, atom2) => {
    const rowDiff = Math.abs(atom1.row - atom2.row);
    const colDiff = Math.abs(atom1.col - atom2.col);
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  // Check if an atom is adjacent to any selected atom
  const isAdjacentToSelected = (atom) => {
    if (selectedAtoms.length === 0) return true; // First atom can be any
    return selectedAtoms.some(selectedAtom => areAtomsAdjacent(atom, selectedAtom));
  };

  // Handle atom selection
  const handleAtomClick = (atom) => {
    if (gameStatus !== 'playing' || moves <= 0) return;
    
    // If this atom is already selected, deselect it only if it's the last one added
    const isSelected = selectedAtoms.some(a => a.id === atom.id);
    
    if (isSelected) {
      if (atom.id === selectedAtoms[selectedAtoms.length - 1].id) {
        // Remove the last atom
        const newSelectedAtoms = [...selectedAtoms];
        newSelectedAtoms.pop();
        
        setSelectedAtoms(newSelectedAtoms);
        updateElementCount(newSelectedAtoms);
      }
      return;
    }
    
    // Check if the atom is adjacent to any existing selection
    if (!isAdjacentToSelected(atom)) {
      setFeedbackMessage("You can only connect adjacent atoms!");
      setShowFeedback(true);
      return;
    }
    
    // Add to selection
    const newSelectedAtoms = [...selectedAtoms, atom];
    setSelectedAtoms(newSelectedAtoms);
    
    // Update element count display
    updateElementCount(newSelectedAtoms);
    
    // Visual feedback for successful selection
    const atomElement = document.getElementById(`atom-${atom.id}`);
    if (atomElement) {
      atomElement.classList.add('pulse-effect');
      setTimeout(() => {
        atomElement.classList.remove('pulse-effect');
      }, 300);
    }
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
        setFeedbackMessage(`Compound Brewed! You formed ${target.formula}`);
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
    setConnections([]);
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

  // Render atom on the game board with selection order
  const renderAtom = (atom) => {
    const isSelected = selectedAtoms.some(a => a.id === atom.id);
    const selectionOrder = getSelectionOrder(atom);
    const elementData = elementInfo[atom.element] || { 
      color: 'linear-gradient(135deg, #777, #555)', 
      bgStyle: 'radial-gradient(circle, #777, #555)',
      name: atom.element, 
      weight: 0,
      symbol: atom.element,
      borderColor: '#444'
    };
    
    return (
      <div 
        id={`atom-${atom.id}`}
        key={atom.id}
        className={`atom ${isSelected ? 'selected' : ''}`}
        style={{ 
          background: elementData.bgStyle,
          borderColor: elementData.borderColor
        }}
        onClick={() => handleAtomClick(atom)}
        title={`${elementData.name} (${atom.element})`}
      >
        <div className="atom-symbol">{atom.element}</div>
        <div className="electron-shell"></div>
        {isSelected && 
          <div className="selection-order">{selectionOrder}</div>
        }
      </div>
    );
  };

  // Instead of rendering lines, we'll visualize the connection through selection order
  const getSelectionOrder = (atom) => {
    const index = selectedAtoms.findIndex(a => a.id === atom.id);
    return index >= 0 ? index + 1 : null;
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
                <li>Click on adjacent atoms to connect them</li>
                <li>Pay attention to the ratio display as you select</li>
                <li>Form compounds by selecting atoms in the correct ratio</li>
                <li>Click "Brew Compound" to check your selection</li>
              </ol>
            </div>
            
            <div className="example-section">
              <p className="section-title">Example: Water (H₂O)</p>
              <div className="example-atoms">
                <div className="example-atom" style={{ background: elementInfo['H'].bgStyle }}>H</div>
                <div className="example-atom" style={{ background: elementInfo['H'].bgStyle }}>H</div>
                <div className="example-atom" style={{ background: elementInfo['O'].bgStyle }}>O</div>
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
                    {Math.round((correctTries / (correctTries + incorrectTries || 1)) * 100)}%
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
                  style={{ background: elementInfo[element]?.bgStyle || '#777' }}
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
    
    const isCorrect = feedbackMessage.startsWith('Compound') || feedbackMessage.startsWith('Correct');
    
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
        <div className="game-board-wrapper">
          <div className="game-board">
            {gameBoard.flat().map(atom => renderAtom(atom))}
          </div>
        </div>
        
        {/* Selected Atoms Display */}
        <div className="selection-display">
          {selectedAtoms.length > 0 ? (
            <div className="selected-atoms">
              {selectedAtoms.map((atom, idx) => (
                <React.Fragment key={atom.id}>
                  <div 
                    className="selected-atom"
                    style={{ background: elementInfo[atom.element]?.bgStyle || '#777' }}
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
              setConnections([]);
              setShowElementCount({});
            }}
            disabled={selectedAtoms.length === 0}
          >
            Clear Selection
          </button>
          
          <button 
            className={`brew-button ${selectedAtoms.length === 0 ? 'disabled' : ''}`}
            onClick={checkCompound}
            disabled={selectedAtoms.length === 0}
          >
            <Icons.Flask /> Brew Compound
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

      <style jsx>{`
        /* Game container */
        .game-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        /* Header */
        .game-header {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header-bar {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .title-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .game-title {
          font-size: 24px;
          font-weight: bold;
        }
        
        .level-indicator {
          font-size: 18px;
          font-weight: 600;
        }
        
        .info-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        
        .info-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .game-info {
          padding: 15px;
        }
        
        .stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .stat-item {
          font-size: 14px;
        }
        
        .stat-value {
          color: #3b82f6;
          font-weight: bold;
        }
        
        /* Target box */
        .target-box {
          background-color: #e6f0ff;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .target-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .target-label, .target-score {
          font-size: 14px;
          font-weight: 600;
        }
        
        .target-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .compound-formula {
          font-size: 20px;
          font-weight: bold;
        }
        
        .compound-description {
          font-size: 14px;
        }
        
        /* Progress box */
        .progress-box {
          background-color: #e6ffed;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .progress-label {
          font-size: 14px;
          font-weight: 600;
        }
        
        .progress-count {
          display: flex;
          align-items: center;
        }
        
        .count-value {
          font-size: 18px;
          font-weight: bold;
          color: #22c55e;
        }
        
        .count-label {
          font-size: 14px;
          margin-left: 4px;
        }
        
        .progress-bar-container {
          height: 8px;
          background-color: #d1d5db;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #22c55e;
          transition: width 0.5s ease;
        }
        
        /* Ratio display */
        .ratio-display {
          background-color: #fff9e6;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .ratio-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .ratio-values {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
        }
        
        .ratio-element {
          display: flex;
          align-items: center;
        }
        
        .small-atom {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .element-count {
          font-weight: bold;
          margin-left: 5px;
        }
        
        .ratio-separator {
          font-weight: bold;
        }
        
        /* Feedback message */
        .feedback-message {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
        }
        
        .feedback-message.correct {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .feedback-message.incorrect {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Game board */
        .board-container {
          background-color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .game-board-wrapper {
          position: relative;
          margin-bottom: 16px;
        }
        
        .game-board {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }
        
        .connections-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .connection {
          position: absolute;
          height: 4px;
          background-color: rgba(59, 130, 246, 0.6);
          transform-origin: 0 50%;
          border-radius: 2px;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
        }
        
        .atom {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 4px;
          border: 2px solid transparent;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .atom .electron-shell {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px dotted rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: rotate 10s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .atom.selected {
          transform: scale(1.1);
          box-shadow: 0 0 0 3px #fbbf24, 0 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }
        
        /* Selected atoms display */
        .selection-display {
          background-color: #f3f4f6;
          border-radius: 6px;
          padding: 16px;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .selected-atoms {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }
        
        .selected-atom {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          margin: 4px;
        }
        
        .plus-sign {
          margin: 0 4px;
        }
        
        .selection-hint {
          color: #6b7280;
          font-size: 14px;
        }
        
        /* Hint box */
        .hint-box {
          background-color: #e6ffed;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .hint-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        /* Action buttons */
        .action-buttons {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .clear-button, .brew-button {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .clear-button {
          background-color: #e5e7eb;
          color: #4b5563;
        }
        
        .clear-button:hover:not(.disabled) {
          background-color: #d1d5db;
        }
        
        .brew-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        
        .brew-button:hover:not(.disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
        }
        
        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Level navigation */
        .level-navigation {
          display: flex;
          justify-content: space-between;
        }
        
        .nav-button {
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        .prev-button, .next-button {
          background-color: #e5e7eb;
          color: #4b5563;
        }
        
        .prev-button:hover:not(.disabled), .next-button:hover:not(.disabled) {
          background-color: #d1d5db;
        }
        
        .restart-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        
        .restart-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
        }
        
        /* Modal and overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        
        .modal {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          max-width: 90%;
          width: 500px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: bold;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        
        .close-button:hover {
          background-color: #f3f4f6;
        }
        
        .modal-content {
          margin-bottom: 16px;
        }
        
        .section-heading {
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .tutorial-section, .example-section {
          background-color: #f3f8ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .example-section {
          background-color: #fff9e6;
        }
        
        .section-title {
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .tutorial-section ol {
          padding-left: 20px;
          list-style-position: inside;
        }
        
        .tutorial-section li {
          margin-bottom: 6px;
        }
        
        .example-atoms {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .example-atom {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }
        
        .equals {
          font-weight: bold;
        }
        
        .compound {
          padding: 4px 8px;
          background-color: #e6ffed;
          border-radius: 4px;
        }
        
        .start-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .start-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
        }
        
        /* Game over modal */
        .result-title {
          font-size: 24px;
          text-align: center;
          font-weight: bold;
          margin-bottom: 16px;
        }
        
        .result-content {
          margin-bottom: 16px;
          text-align: center;
        }
        
        .result-content p {
          margin-bottom: 8px;
        }
        
        .info-box {
          background-color: #f3f8ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: left;
        }
        
        .info-box.green {
          background-color: #e6ffed;
        }
        
        .info-title {
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .compound-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        
        .compound-tag {
          background-color: #e6f0ff;
          border-radius: 16px;
          padding: 4px 8px;
          font-size: 14px;
        }
        
        .score {
          font-size: 18px;
          font-weight: 600;
          margin-top: 16px;
        }
        
        .button-row {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        
        .game-button {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        .retry-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        
        .retry-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
        }
        
        .next-button, .play-again-button {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }
        
        .next-button:hover:not(.disabled), .play-again-button:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
          transform: translateY(-2px);
        }
        
        /* Icons */
        .icon {
          font-size: 16px;
          display: inline-block;
        }
        
        /* Trophy icon in game completion */
        .trophy-icon {
          font-size: 60px;
          margin-bottom: 16px;
        }
        
        .congratulations {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .final-stats {
          background-color: #f3f8ff;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .final-stats h3 {
          text-align: center;
          margin-bottom: 12px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .stat-box {
          background-color: white;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .stat-label {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
        }
        
        .mastery-message {
          font-size: 16px;
          font-weight: 500;
          color: #4b5563;
        }
        
        /* Responsive adjustments */
        @media (max-width: 600px) {
          .game-container {
            padding: 10px;
          }
          
          .atom {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .compound-formula {
            font-size: 18px;
          }
          
          .compound-description {
            font-size: 12px;
          }
          
          .nav-button {
            padding: 6px 10px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChemistryCrush;