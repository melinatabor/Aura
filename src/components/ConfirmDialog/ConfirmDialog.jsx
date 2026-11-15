import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check } from 'lucide-react'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box modal-confirm" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="modal-body">
          <div className={`modal-confirm-icon ${tone === 'danger' ? 'icon-danger' : 'icon-success'}`}>
            {tone === 'danger' ? <AlertTriangle size={24} /> : <Check size={24} strokeWidth={3} />}
          </div>
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
