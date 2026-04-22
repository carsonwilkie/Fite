function LightsaberLoader({ percent }) {
  const pct = Math.min(percent, 1);
  const isComplete = pct >= 1;
  const isActive = pct > 0;

  // The blade starts ~ 120px from the left (after the hilt). The aura
  // mirrors the blade's horizontal extent so the red glow only spans the
  // lit portion of the blade, not the full track.
  const hiltWidth = 120;
  // The glow starts slightly behind the hilt so it wraps around the emitter.
  const auraLeft = hiltWidth - 12;
  const auraWidthCss = `calc((100% - ${hiltWidth}px) * ${pct} + 18px)`;

  return (
    <div className="ls-container">
      {/* Red blade aura — rendered first so it sits behind everything. */}
      <div
        className={`ls-aura${isActive ? " ls-aura-active" : ""}${isComplete ? " ls-aura-complete" : ""}`}
        style={{ left: auraLeft, width: auraWidthCss }}
      />

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
