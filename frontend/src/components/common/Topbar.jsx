import { Link } from 'react-router-dom';

export default function Topbar({ subtitulo, badge, inicio = '/', className = '', children }) {
  return (
    <header className={`topbar ${className}`}>
      <Link to={inicio} className="brand">
        <div className="logo" aria-hidden="true">U</div>
        <div>
          <div className="brand-title">ULTRAPORT · NEXPORT</div>
          <div className="brand-sub">{subtitulo}</div>
        </div>
      </Link>
      {children}
      {badge && <div className="badge">{badge}</div>}
    </header>
  );
}
