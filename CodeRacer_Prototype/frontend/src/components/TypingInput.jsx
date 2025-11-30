// components/TypingInput.jsx
import { useRef, useEffect } from "react";

export default function TypingInput({ 
  value, 
  onChange, 
  onKeyDown,
  consecutiveErrors, 
  maxErrors = 7,
  currentLine = "",
  lineNumber = 1,
  totalLines = 1,
  autoFocus = false,
  disabled = false
}) {
  const inputRef = useRef(null);

  const handlePaste = (e) => {
    e.preventDefault();
  };

  // Re-focus on click
  useEffect(() => {
    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [disabled]);

  return (
    <div className="input-container">
      <div className="input-label">
        Type line {lineNumber}/{totalLines}: (Press Enter when complete)
        {consecutiveErrors >= maxErrors && (
          <span className="error-warning"> - Delete to continue!</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`typing-input ${consecutiveErrors > 0 ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        placeholder={currentLine}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        autoFocus={autoFocus}
      />
    </div>
  );
}