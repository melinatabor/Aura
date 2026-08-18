import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmployeeFormModal from './EmployeeFormModal.jsx'
import * as employeesService from '../../services/employeesService'

export default function EmployeesRoles() {
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  async function reload() {
    setEmployees(await employeesService.getAll())
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleSave(data) {
    if (modal.mode === 'create') {
      await employeesService.create(data)
    } else {
      await employeesService.update(modal.employee.id, data)
    }
    setModal(null)
    reload()
  }

  async function handleDelete() {
    await employeesService.remove(toDelete.id)
    setToDelete(null)
    reload()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Empleados y roles</h1>
          <p>Administrá el equipo con acceso al sistema y el rol asignado a cada uno.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nuevo rol
        </button>
      </div>

      {employees.length === 0 ? (
        <EmptyState title="Todavía no hay empleados cargados" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Empleado</th>
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
                  <td>{e.email}</td>
                  <td>
                    <Badge variant={e.role === 'Administrador' ? 'info' : 'neutral'}>{e.role}</Badge>
                  </td>
                  <td>
                    <Badge>{e.status}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ mode: 'edit', employee: e })}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setToDelete(e)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EmployeeFormModal employee={modal.mode === 'edit' ? modal.employee : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {toDelete && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas eliminar este empleado?"
          message="El empleado perderá el acceso al sistema con el rol asignado."
          confirmLabel="Sí, eliminar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
