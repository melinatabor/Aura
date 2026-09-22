import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmployeeFormModal from './EmployeeFormModal.jsx'
import * as employeesService from '../../bll/employeesService'

export default function EmployeesRoles() {
  const [employees, setEmployees] = useState([])
  const [editing, setEditing] = useState(null)
  const [toToggle, setToToggle] = useState(null)

  async function reload() {
    setEmployees(await employeesService.getAll())
  }

  useEffect(() => {
    reload()
  }, [])

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

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Empleados y roles</h1>
          <p>Administrá el rol y el estado de las cuentas que ya se registraron en AURA.</p>
        </div>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          title="Todavía no hay empleados registrados"
          description="Las cuentas se crean desde “Crear cuenta” en la pantalla de inicio de sesión; después les asignás el rol acá."
        />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>
                      {e.firstName} {e.lastName}
                    </strong>
                  </td>
                  <td>{e.username || '—'}</td>
                  <td>{e.email}</td>
                  <td>
                    <Badge variant={e.role === 'Administrador' ? 'info' : 'neutral'}>{e.role}</Badge>
                  </td>
                  <td>
                    <Badge>{e.status}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(e)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setToToggle(e)}>
                        {e.status === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EmployeeFormModal employee={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      {toToggle && (
        <ConfirmDialog
          title={`¿Confirmás ${toToggle.status === 'Activo' ? 'desactivar' : 'activar'} a este empleado?`}
          message="Desactivar no borra la cuenta, solo le quita el acceso operativo al sistema."
          confirmLabel="Confirmar"
          onConfirm={handleToggleStatus}
          onCancel={() => setToToggle(null)}
        />
      )}
    </div>
  )
}
