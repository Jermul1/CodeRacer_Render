// components/ParticipantsList.jsx
export default function ParticipantsList({ participants, totalSnippetLength }) {
  return (
    <div className="participants-progress">
      {participants.map((p) => {
        const progress = (p.progress / totalSnippetLength) * 100;
        return (
          <div key={p.user_id} className="participant-row">
            <div className="participant-info">
              <span className="participant-name">{p.username}</span>
              <span className="participant-wpm">{Math.round(p.wpm)} WPM</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              >
                {p.is_finished && <span className="finish-flag">🏁</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}