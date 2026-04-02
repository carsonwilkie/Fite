function ElectricBorder({ children, active }) {
  if (!active) return <div className="eb-wrapper">{children}</div>;
  return (
    <div className="eb-wrapper eb-active">
      <div className="eb-spin-container">
        <div className="eb-spin" />
      </div>
      <div className="eb-glow-layer" />
      {children}
    </div>
  );
}

export default ElectricBorder;
