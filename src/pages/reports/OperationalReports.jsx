import { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as reportsService from '../../bll/reportsService'
import { downloadOperationalReportPdf } from '../../utils/pdfExport'
import './Reports.scss'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export default function OperationalReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState(null)
  const [history, setHistory] = useState([])
  const [exported, setExported] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function loadHistory() {
    setHistory(await reportsService.getExportHistory())
  }

  useEffect(() => {
    reportsService.getReports().then(setReports)
    loadHistory()
  }, [])

  if (!reports) return null

  const maxOccupancy = Math.max(1, ...reports.occupancyByProfessional.map((o) => o.appointments))
  const maxPerformance = Math.max(1, ...reports.performanceByTreatment.map((d) => d.completed))

  async function handleExport() {
    setExporting(true)
    try {
      await reportsService.exportReport(user.id)
      downloadOperationalReportPdf(reports)
      setExported(true)
      loadHistory()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Reportes operativos</h1>
          <p>Consultá turnos, tratamientos y desempeño del equipo con los datos actuales del sistema.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exportando...' : 'Exportar reporte'}
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Ingresos por turnos realizados" value={priceFormatter.format(reports.totalRevenue)} />
        <StatCard label="Turnos realizados" value={reports.completedAppointments} />
        <StatCard label="Clientes activos" value={reports.activePatients} />
      </div>

      <div className="reports-columns">
        <section className="aura-card">
          <h2 className="section-title">Ocupación por profesional</h2>
          <div className="reports-bars">
            {reports.occupancyByProfessional.map((o) => (
              <div key={o.professional} className="reports-bar-row">
                <span className="reports-bar-label">{o.professional}</span>
                <div className="reports-bar-track">
                  <div className="reports-bar-fill" style={{ width: `${(o.appointments / maxOccupancy) * 100}%` }} />
                </div>
                <span className="reports-bar-value">{o.appointments}</span>
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
                {reports.performanceByTreatment.map((d) => (
                  <tr key={d.treatment}>
                    <td>{d.treatment}</td>
                    <td>
                      <div className="reports-bar-track reports-bar-track-sm">
                        <div className="reports-bar-fill" style={{ width: `${(d.completed / maxPerformance) * 100}%` }} />
                      </div>
                    </td>
                    <td>{priceFormatter.format(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="aura-card" style={{ marginTop: 24 }}>
        <h2 className="section-title">Historial de exportaciones</h2>
        {history.length === 0 ? (
          <EmptyState title="Todavía no se exportó ningún reporte" />
        ) : (
          <div className="aura-table-wrap">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ingresos</th>
                  <th>Turnos realizados</th>
                  <th>Clientes activos</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{dateFormatter.format(new Date(h.createdAt))}</td>
                    <td>{priceFormatter.format(h.totalRevenue)}</td>
                    <td>{h.completedAppointments}</td>
                    <td>{h.activePatients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {exported && (
        <Modal title="Reporte exportado" onClose={() => setExported(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>
              El reporte operativo se descargó en PDF y se guardó en el historial correctamente.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setExported(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
