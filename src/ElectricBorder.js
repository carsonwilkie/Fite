function ElectricBorder({ children, active }) {
  if (!active) return <div className="eb-wrapper">{children}</div>;
  return (
    <div className="eb-wrapper" style={{ position: "relative" }}>
      <div className="eb-glow-layer" />
      <div className="eb-active">
        <div className="eb-spin-container">
          <div className="eb-spin" />
        </div>
        <div className="eb-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ElectricBorder;
