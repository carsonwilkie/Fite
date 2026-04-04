function LightsaberLoader({ percent }) {
  const pct = Math.min(percent, 1);
  const isComplete = pct >= 1;

  return (
    <div className="ls-container">
      {/* Hilt */}
      <div className="ls-hilt">
        <div className="ls-tip" />
        <div className="ls-grip ls-grip1" />
        <div className="ls-grip ls-grip2" />
        <div className="ls-grip ls-grip3" />
        <div className="ls-center" />
        <div className="ls-center-bottom" />
        <div className="ls-hole ls-hole1" />
        <div className="ls-hole ls-hole2" />
        <div className="ls-cable ls-cable1" />
        <div className="ls-cable ls-cable2" />
        <div className="ls-guard-tip" />
        <div className="ls-guard-rect">
          <div className="ls-guard-shadow" />
        </div>
        <div className="ls-guard-tri" />
        <div className="ls-guard-tri-shadow" />
        <div className="ls-hilt-shadow" />
      </div>

      {/* Blade track */}
      <div className="ls-blade-track">
        <div
          className={`ls-blade-fill${isComplete ? " ls-blade-complete" : ""}`}
          style={{ width: `${pct * 100}%` }}
        >
          <div className={`ls-blade-glow${isComplete ? " ls-blade-glow-active" : ""}`} />
        </div>
      </div>
    </div>
  );
}

export default LightsaberLoader;
