import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmpleadoFormModal from './EmpleadoFormModal.jsx'
import * as empleadosService from '../../services/empleadosService'

export default function EmpleadosRoles() {
  const [empleados, setEmpleados] = useState([])
  const [modal, setModal] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  async function recargar() {
    setEmpleados(await empleadosService.getAll())
  }

  useEffect(() => {
    recargar()
  }, [])

  async function handleGuardar(datos) {
    if (modal.modo === 'crear') {
      await empleadosService.create(datos)
    } else {
      await empleadosService.update(modal.empleado.id, datos)
    }
    setModal(null)
    recargar()
  }

  async function handleEliminar() {
    await empleadosService.remove(aEliminar.id)
    setAEliminar(null)
    recargar()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Empleados y roles</h1>
          <p>Administrá el equipo con acceso al sistema y el rol asignado a cada uno.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ modo: 'crear' })}>
          + Nuevo rol
        </button>
      </div>

      {empleados.length === 0 ? (
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
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>
                      {e.nombre} {e.apellido}
                    </strong>
                  </td>
                  <td>{e.email}</td>
                  <td>
                    <Badge variant={e.rol === 'Administrador' ? 'info' : 'neutral'}>{e.rol}</Badge>
                  </td>
                  <td>
                    <Badge>{e.estado}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ modo: 'editar', empleado: e })}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setAEliminar(e)}>
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
        <EmpleadoFormModal empleado={modal.modo === 'editar' ? modal.empleado : null} onSave={handleGuardar} onClose={() => setModal(null)} />
      )}

      {aEliminar && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas eliminar este empleado?"
          message="El empleado perderá el acceso al sistema con el rol asignado."
          confirmLabel="Sí, eliminar"
          onConfirm={handleEliminar}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  )
}
