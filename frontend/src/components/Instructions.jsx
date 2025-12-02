// components/Instructions.jsx
import { useState } from "react";

export default function Instructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="instructions-container">
      <button
        className="instructions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="instructions-icon">{isExpanded ? '▼' : '▶'}</span>
        Instructions
      </button>
      
      {isExpanded && (
        <div className="instructions-content">
          <ol className="instructions-list">
            <li>Type the highlighted line fully without errors</li>
            <li>When line is complete, press Enter to go to next line in code</li>
            <li>Complete race within the time limit</li>
            <li>有志者事竟成 </li>
            <li>Type fast and with 100% accuracy</li>
          </ol>
        </div>
      )}
    </div>
  );
}