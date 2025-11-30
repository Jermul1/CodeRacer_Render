import React, { useEffect, useState } from "react";
import "../styles/LogoAnimation.css";

const LOGO_TEXT = "CodeRacer";

const WAIT_AFTER_TYPED_MS = 10000;
const TYPE_INTERVAL_MS = 500;
const BACKSPACE_INTERVAL_MS = 100;
const OPEN_TO_TYPE_DELAY_MS = 100;
const MOUNT_TO_OPEN_DELAY_MS = 100;
const LOOP_DELAY_MS = 500;

export default function LogoAnimation({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const openTimeout = setTimeout(() => setStage(1), MOUNT_TO_OPEN_DELAY_MS);
    return () => clearTimeout(openTimeout);
  }, []);

  useEffect(() => {
    let t;

    if (stage === 1) {
      t = setTimeout(() => setStage(2), OPEN_TO_TYPE_DELAY_MS);
    }
    else if (stage === 2 && typed.length < LOGO_TEXT.length) {
      t = setTimeout(() => {
        setTyped(LOGO_TEXT.slice(0, typed.length + 1));
      }, TYPE_INTERVAL_MS);
    }
    else if (stage === 2 && typed.length === LOGO_TEXT.length) {
      t = setTimeout(() => setStage(3), WAIT_AFTER_TYPED_MS);
    }
    else if (stage === 3) {
      t = setTimeout(() => setStage(4), 10);
    }
    else if (stage === 4 && typed.length > 0) {
      t = setTimeout(() => {
        setTyped(typed.slice(0, -1));
      }, BACKSPACE_INTERVAL_MS);
    }
    else if (stage === 4 && typed.length === 0) {
      t = setTimeout(() => setStage(0), LOOP_DELAY_MS);
    }
    else if (stage === 0 && typed.length === 0) {
      t = setTimeout(() => setStage(1), MOUNT_TO_OPEN_DELAY_MS);
    }

    return () => clearTimeout(t);
  }, [stage, typed, onComplete]);

  let leftClass = "bracket";
  let rightClass = "bracket";

  if (stage === 1) {
    leftClass += " open";
    rightClass += " open";
  }

  return (
    <div className="logo-animation">
      <span className={leftClass}>&lt;</span>
      <span className="logo-text">{typed}</span>
      <span className={rightClass}>/&gt;</span>
    </div>
  );
}