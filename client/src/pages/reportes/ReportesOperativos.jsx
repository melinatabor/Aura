import { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import * as reportesService from '../../services/reportesService'
import './Reportes.scss'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function ReportesOperativos() {
  const [reportes, setReportes] = useState(null)
  const [exportado, setExportado] = useState(false)

  useEffect(() => {
    reportesService.getReportes().then(setReportes)
  }, [])

  if (!reportes) return null

  const maxOcupacion = Math.max(1, ...reportes.ocupacionPorProfesional.map((o) => o.turnos))
  const maxDesempeno = Math.max(1, ...reportes.desempenoPorTratamiento.map((d) => d.realizados))

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Reportes operativos</h1>
          <p>Consultá turnos, tratamientos y desempeño del equipo con los datos actuales del sistema.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setExportado(true)}>
          Exportar reporte
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Ingresos por turnos realizados" value={formatoPrecio.format(reportes.ingresosTotales)} />
        <StatCard label="Turnos realizados" value={reportes.turnosRealizados} />
        <StatCard label="Clientes activos" value={reportes.clientesActivos} />
      </div>

      <div className="reportes-columns">
        <section className="aura-card">
          <h2 className="section-title">Ocupación por profesional</h2>
          <div className="reportes-bars">
            {reportes.ocupacionPorProfesional.map((o) => (
              <div key={o.profesional} className="reportes-bar-row">
                <span className="reportes-bar-label">{o.profesional}</span>
                <div className="reportes-bar-track">
                  <div className="reportes-bar-fill" style={{ width: `${(o.turnos / maxOcupacion) * 100}%` }} />
                </div>
                <span className="reportes-bar-value">{o.turnos}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="aura-card">
          <h2 className="section-title">Desempeño por tratamiento</h2>
          <div className="aura-table-wrap">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Tratamiento</th>
                  <th>Realizados</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {reportes.desempenoPorTratamiento.map((d) => (
                  <tr key={d.tratamiento}>
                    <td>{d.tratamiento}</td>
                    <td>
                      <div className="reportes-bar-track reportes-bar-track-sm">
                        <div className="reportes-bar-fill" style={{ width: `${(d.realizados / maxDesempeno) * 100}%` }} />
                      </div>
                    </td>
                    <td>{formatoPrecio.format(d.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {exportado && (
        <Modal title="Reporte exportado" onClose={() => setExportado(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>El reporte operativo se generó correctamente con los datos actuales.</p>
            <button type="button" className="btn btn-primary" onClick={() => setExportado(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
