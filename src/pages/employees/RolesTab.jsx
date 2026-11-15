import { Fragment, useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as rolesService from '../../bll/rolesService'
import { LOCKED_ROLE } from '../../bll/rolesService'

function sameIds(a, b) {
  return a.length === b.length && a.every((id) => b.includes(id))
}

export default function RolesTab() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '' })
  const [createError, setCreateError] = useState('')

  async function reload() {
    const [r, p] = await Promise.all([rolesService.getAll(), rolesService.getPermissions()])
    setRoles(r)
    setPermissions(p)
    setDraft(Object.fromEntries(r.map((role) => [role.id, role.permissionIds])))
  }

  useEffect(() => {
    reload()
  }, [])

  const modules = [...new Set(permissions.map((p) => p.module))]
  const changedRoles = roles.filter((role) => draft[role.id] && !sameIds(draft[role.id], role.permissionIds))

  function toggle(roleId, permissionId) {
    setMessage('')
    setDraft((prev) => {
      const current = prev[roleId] ?? []
      const next = current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId]
      return { ...prev, [roleId]: next }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const role of changedRoles) {
        await rolesService.setPermissions(role, draft[role.id])
      }
      await reload()
      setMessage('Permisos actualizados. Cada usuario los ve aplicados la próxima vez que inicia sesión.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    try {
      await rolesService.create(newRole)
      setCreating(false)
      setNewRole({ name: '', description: '' })
      reload()
    } catch (err) {
      setCreateError(err.code === '23505' ? 'Ya existe un rol con ese nombre.' : 'No se pudo crear el rol.')
    }
  }

  return (
    <>
      <div className="list-toolbar" style={{ marginTop: 0 }}>
        <p className="field-hint">
          Estos permisos se aplican en la interfaz y también en la base de datos (políticas RLS de Supabase).
        </p>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setCreating(true)}>
            + Nuevo rol
          </button>
          <button type="button" className="btn btn-primary" disabled={changedRoles.length === 0 || saving} onClick={handleSave}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {message && <p className="roles-message">{message}</p>}

      <div className="aura-table-wrap">
        <table className="aura-table roles-matrix">
          <thead>
            <tr>
              <th>Permiso</th>
              {roles.map((role) => (
                <th key={role.id} title={role.description}>
                  {role.name}
                  {role.isCustom && <span className="roles-custom-tag">personalizado</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <Fragment key={module}>
                <tr className="roles-module-row">
                  <td colSpan={roles.length + 1}>{module}</td>
                </tr>
                {permissions
                  .filter((p) => p.module === module)
                  .map((permission) => (
                    <tr key={permission.id}>
                      <td>{permission.description}</td>
                      {roles.map((role) => (
                        <td key={role.id} className="roles-check-cell">
                          <input
                            type="checkbox"
                            aria-label={`${role.name}: ${permission.description}`}
                            checked={(draft[role.id] ?? []).includes(permission.id)}
                            disabled={role.name === LOCKED_ROLE}
                            onChange={() => toggle(role.id, permission.id)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="field-hint" style={{ marginTop: 12 }}>
        El rol Administrador siempre tiene todos los permisos, para que nunca se pierda el acceso a esta pantalla.
      </p>

      {creating && (
        <Modal title="Nuevo rol" onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="roleName">Nombre</label>
              <input
                id="roleName"
                required
                placeholder="ej. Encargada de turno"
                value={newRole.name}
                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roleDescription">Descripción</label>
              <textarea
                id="roleDescription"
                rows={2}
                value={newRole.description}
                onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
              />
              <span className="field-hint">Se crea sin permisos: después los marcás en la tabla.</span>
            </div>
            {createError && <p className="field-error">{createError}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Crear rol
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
