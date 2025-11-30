// components/RaceCountdown.jsx
export default function RaceCountdown({ countdown }) {
  if (countdown <= 0) return null;

  return (
    <div className="countdown-screen">
      <div className="countdown-number">{countdown}</div>
      <div className="countdown-text">Get ready to type!</div>
    </div>
  );
}