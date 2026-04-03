function PremiumBadge({ small }) {
  return (
    <div className="premium-badge-wrapper">
      <div className="premium-badge-glow-layer">
        <div className="premium-badge-eclipse-glow" />
      </div>
      <div className="premium-badge-body">
        <div className="premium-badge-eclipse" />
        <div className={`premium-badge-content${small ? " premium-badge-small" : ""}`}>
          <div className="premium-badge-shine" />
          PREMIUM
        </div>
      </div>
    </div>
  );
}

export default PremiumBadge;
