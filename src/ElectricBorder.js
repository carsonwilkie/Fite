function ElectricBorder({ children, active }) {
  return (
    <div className={`eb-wrapper${active ? " eb-active" : ""}`}>
      {active && <div className="eb-bg-glow" />}
      {children}
      {active && (
        <>
          <div className="eb-main-card" />
          <div className="eb-glow-1" />
          <div className="eb-glow-2" />
          <div className="eb-overlay-1" />
          <div className="eb-overlay-2" />
        </>
      )}
    </div>
  );
}

export default ElectricBorder;
