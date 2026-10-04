export default function SectionHead({ eyebrow, titulo, first = false, children }) {
  return (
    <div className={`section-head${first ? ' first' : ''}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{titulo}</h2>
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  );
}
