export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box" style={{ textAlign: 'center' }}>
        <div className={`modal-confirm-icon ${tone === 'danger' ? 'icon-danger' : 'icon-success'}`}>
          {tone === 'danger' ? '⚠' : '✓'}
        </div>
        <h2 style={{ marginBottom: 8 }}>{title}</h2>
        <p style={{ color: '#6f6b60', marginBottom: 24 }}>{message}</p>
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
