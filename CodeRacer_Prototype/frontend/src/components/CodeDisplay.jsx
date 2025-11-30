// components/CodeDisplay.jsx
import "../styles/MultiplayerRace.css";

export default function CodeDisplay({ lines, currentLineIndex, completedLines, userInput }) {
  // Get the leading spaces count for a line
  const getLeadingSpaces = (lineIndex) => {
    if (lineIndex >= lines.length) return 0;
    const line = lines[lineIndex];
    return line.length - line.trimStart().length;
  };

  return (
    <div className="code-display">
      {lines.map((line, lineIndex) => {
        const isCompleted = lineIndex < currentLineIndex;
        const isCurrent = lineIndex === currentLineIndex;
        const leadingSpaces = getLeadingSpaces(lineIndex);
        const trimmedLine = line.trimStart();

        return (
          <div 
            key={lineIndex} 
            className={`code-line ${isCurrent ? 'line-current' : ''} ${isCompleted ? 'line-completed' : ''}`}
          >
            {/* Leading spaces (indentation) */}
            {leadingSpaces > 0 && (
              <span className="line-indent">
                {' '.repeat(leadingSpaces)}
              </span>
            )}
            
            {/* Characters */}
            {trimmedLine.split("").map((char, charIdx) => {
              let charClass = "char-untyped";
              
              if (isCompleted) {
                charClass = "char-correct";
              } else if (isCurrent) {
                if (charIdx < userInput.length) {
                  charClass = userInput[charIdx] === char ? "char-correct" : "char-incorrect";
                } else if (charIdx === userInput.length) {
                  charClass = "char-cursor";
                }
              }

              return (
                <span key={charIdx} className={charClass}>
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}