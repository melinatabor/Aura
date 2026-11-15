import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import * as invitationsService from '../../bll/invitationsService'
import * as rolesService from '../../bll/rolesService'
import * as professionalsService from '../../bll/professionalsService'

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' })

function CopyLinkButton({ token, className = 'btn btn-secondary btn-sm' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(invitationsService.buildLink(token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? '¡Copiado!' : 'Copiar enlace'}
    </button>
  )
}

export default function InvitationsTab() {
  const [invitations, setInvitations] = useState([])
  const [roles, setRoles] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ email: '', roleId: '', professionalId: '' })
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')

  async function reload() {
    const [i, r, p] = await Promise.all([invitationsService.getAll(), rolesService.getAll(), professionalsService.getActive()])
    setInvitations(i)
    setRoles(r)
    setProfessionals(p)
  }

  useEffect(() => {
    reload()
  }, [])

  function openCreate() {
    setForm({ email: '', roleId: roles.find((r) => r.name === 'Operador')?.id ?? roles[0]?.id ?? '', professionalId: '' })
    setError('')
    setCreating(true)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const invitation = await invitationsService.create({
        email: form.email,
        roleId: Number(form.roleId),
        professionalId: form.professionalId ? Number(form.professionalId) : null,
      })
      setCreating(false)
      setCreated(invitation)
      reload()
    } catch {
      setError('No se pudo generar la invitación.')
    }
  }

  async function handleCancel(id) {
    await invitationsService.cancel(id)
    reload()
  }

  return (
    <>
      <div className="list-toolbar" style={{ marginTop: 0 }}>
        <p className="field-hint">
          Quien se registra con el enlace entra directo con el rol asignado. Los enlaces vencen a los 7 días.
        </p>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Nueva invitación
        </button>
      </div>

      {invitations.length === 0 ? (
        <EmptyState title="Todavía no generaste invitaciones" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Creada</th>
                <th>Vence</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <strong>{inv.email}</strong>
                  </td>
                  <td>{inv.roleName}</td>
                  <td>{dateFormatter.format(new Date(inv.createdAt))}</td>
                  <td>{dateFormatter.format(new Date(inv.expiresAt))}</td>
                  <td>
                    <Badge>{inv.status}</Badge>
                  </td>
                  <td>
                    {inv.status === 'Pendiente' && (
                      <div className="table-actions">
                        <CopyLinkButton token={inv.token} />
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(inv.id)}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title="Nueva invitación" onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="inviteEmail">Email de la persona</label>
              <input
                id="inviteEmail"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="inviteRole">Rol</label>
              <select id="inviteRole" value={form.roleId} onChange={(e) => setForm((prev) => ({ ...prev, roleId: e.target.value }))}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inviteProfessional">Vincular con un profesional (opcional)</label>
              <select
                id="inviteProfessional"
                value={form.professionalId}
                onChange={(e) => setForm((prev) => ({ ...prev, professionalId: e.target.value }))}
              >
                <option value="">Ninguno</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="field-error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Generar enlace
              </button>
            </div>
          </form>
        </Modal>
      )}

      {created && (
        <Modal title="Invitación generada" onClose={() => setCreated(null)}>
          <p style={{ marginBottom: 12 }}>
            Mandale este enlace a <strong>{created.email}</strong> (por WhatsApp o por mail). Va a entrar con el rol{' '}
            <strong>{created.roleName}</strong>.
          </p>
          <div className="invitation-link">{invitationsService.buildLink(created.token)}</div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setCreated(null)}>
              Cerrar
            </button>
            <CopyLinkButton token={created.token} className="btn btn-primary" />
          </div>
        </Modal>
      )}
    </>
  )
}
