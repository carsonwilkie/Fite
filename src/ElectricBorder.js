function ElectricBorder({ children, active }) {
  if (!active) return <div className="eb-wrapper">{children}</div>;
  return (
    <div className="eb-wrapper" style={{ position: "relative" }}>
      <div className="eb-bg-glow" />
      <div className="eb-active">
        <div className="eb-spin-container">
          <div className="eb-spin" />
        </div>
        <div className="eb-content">
          {children}
        </div>
      </div>
      <div className="eb-solid-border" />
      <div className="eb-glow-1" />
      <div className="eb-glow-2" />
      <div className="eb-overlay-1" />
      <div className="eb-overlay-2" />
    </div>
  );
}

export default ElectricBorder;
