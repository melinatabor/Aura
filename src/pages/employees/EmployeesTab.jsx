import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmployeeFormModal from './EmployeeFormModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as employeesService from '../../bll/employeesService'
import * as rolesService from '../../bll/rolesService'
import * as professionalsService from '../../bll/professionalsService'

export default function EmployeesTab() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [roles, setRoles] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [editing, setEditing] = useState(null)
  const [toToggle, setToToggle] = useState(null)

  async function reload() {
    const [e, r, p] = await Promise.all([employeesService.getAll(), rolesService.getAll(), professionalsService.getAll()])
    setEmployees(e)
    setRoles(r)
    setProfessionals(p)
  }

  useEffect(() => {
    reload()
  }, [])

  function professionalName(id) {
    const p = professionals.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  async function handleSave(data) {
    await employeesService.update(editing.id, data)
    setEditing(null)
    reload()
  }

  async function handleToggleStatus() {
    await employeesService.setStatus(toToggle.id, toToggle.status === 'Activo' ? 'Inactivo' : 'Activo')
    setToToggle(null)
    reload()
  }

  const pending = employees.filter((e) => e.status === 'Inactivo').length

  return (
    <>
      <div className="stat-grid">
        <StatCard label="Empleados" value={employees.length} />
        <StatCard label="Activos" value={employees.length - pending} />
        <StatCard label="Inactivos o pendientes" value={pending} hint={pending > 0 ? 'Revisá si hay que activarlos' : 'Nada pendiente'} />
      </div>

      {employees.length === 0 ? (
        <EmptyState
          title="Todavía no hay empleados registrados"
          description="Generá una invitación desde la pestaña Invitaciones y compartí el enlace."
        />
      ) : (
        <div className="aura-table-wrap" style={{ marginTop: 24 }}>
          <table className="aura-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Profesional vinculado</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const isSelf = e.id === user.id
                return (
                  <tr key={e.id}>
                    <td>
                      <strong>
                        {e.firstName} {e.lastName}
                      </strong>
                      {isSelf && <span className="employees-self-tag">vos</span>}
                    </td>
                    <td>{e.username || '—'}</td>
                    <td>{e.email}</td>
                    <td>
                      <Badge variant={e.roleName === 'Administrador' ? 'info' : 'neutral'}>{e.roleName}</Badge>
                    </td>
                    <td>{professionalName(e.professionalId)}</td>
                    <td>
                      <Badge>{e.status}</Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(e)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${e.status === 'Activo' ? 'btn-danger' : 'btn-primary'}`}
                          disabled={isSelf}
                          title={isSelf ? 'No podés desactivar tu propia cuenta' : undefined}
                          onClick={() => setToToggle(e)}
                        >
                          {e.status === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EmployeeFormModal
          employee={editing}
          roles={roles}
          professionals={professionals}
          linkedProfessionalIds={employees.filter((e) => e.id !== editing.id).map((e) => e.professionalId)}
          isSelf={editing.id === user.id}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {toToggle && (
        <ConfirmDialog
          title={`¿Confirmás ${toToggle.status === 'Activo' ? 'desactivar' : 'activar'} a ${toToggle.firstName}?`}
          message={
            toToggle.status === 'Activo'
              ? 'No se borra la cuenta, pero pierde el acceso a todos los datos del sistema hasta que se reactive.'
              : 'Va a poder iniciar sesión con el rol que tiene asignado.'
          }
          confirmLabel="Confirmar"
          onConfirm={handleToggleStatus}
          onCancel={() => setToToggle(null)}
        />
      )}
    </>
  )
}
