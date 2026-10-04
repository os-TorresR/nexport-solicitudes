export default function MailPreview({ destinatario, asunto, mensaje }) {
  return (
    <div className="mail-preview">
      <div className="mail-head">
        <span>
          <b>Para:</b> {destinatario || '—'}
        </span>
        <span>
          <b>Asunto:</b> {asunto}
        </span>
      </div>
      <div className="mail-body">{mensaje}</div>
    </div>
  );
}
