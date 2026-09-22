import jsPDF from 'jspdf'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' })

function newDoc(title) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('AURA', 14, 18)
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(title, 14, 26)
  doc.setTextColor(0)
  doc.setFontSize(9)
  doc.text(`Generado el ${dateFormatter.format(new Date())}`, 14, 32)
  doc.setDrawColor(200)
  doc.line(14, 36, 196, 36)
  return doc
}

function drawTable(doc, startY, headers, rows, colWidths) {
  let y = startY
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  let x = 14
  headers.forEach((h, i) => {
    doc.text(h, x, y)
    x += colWidths[i]
  })
  doc.setFont(undefined, 'normal')
  y += 3
  doc.setDrawColor(230)
  doc.line(14, y, 196, y)
  y += 6

  rows.forEach((row) => {
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    x = 14
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y)
      x += colWidths[i]
    })
    y += 7
  })
  return y
}

export function downloadOperationalReportPdf(report) {
  const doc = newDoc('Reporte operativo')
  let y = 46

  doc.setFontSize(11)
  doc.text(`Ingresos por turnos realizados: ${priceFormatter.format(report.totalRevenue)}`, 14, y)
  y += 7
  doc.text(`Turnos realizados: ${report.completedAppointments}`, 14, y)
  y += 7
  doc.text(`Clientes activos: ${report.activePatients}`, 14, y)
  y += 12

  doc.setFontSize(13)
  doc.text('Ocupación por profesional', 14, y)
  y += 8
  y = drawTable(
    doc,
    y,
    ['Profesional', 'Turnos'],
    report.occupancyByProfessional.map((o) => [o.professional, o.appointments]),
    [120, 40],
  )

  y += 8
  doc.setFontSize(13)
  doc.text('Desempeño por tratamiento', 14, y)
  y += 8
  drawTable(
    doc,
    y,
    ['Tratamiento', 'Realizados', 'Ingresos'],
    report.performanceByTreatment.map((d) => [d.treatment, d.completed, priceFormatter.format(d.revenue)]),
    [90, 40, 40],
  )

  doc.save(`reporte-operativo-${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function downloadStockExportPdf(supplies) {
  const doc = newDoc('Exportación de stock')
  const lowStock = supplies.filter((s) => s.status === 'Activo' && s.currentStock <= s.minStock)
  const totalValue = supplies.reduce((sum, s) => sum + s.currentStock * (s.price ?? 0), 0)
  let y = 46

  doc.setFontSize(11)
  doc.text(`Insumos registrados: ${supplies.length}`, 14, y)
  y += 7
  doc.text(`Con stock bajo: ${lowStock.length}`, 14, y)
  y += 7
  doc.text(`Valor de stock estimado: ${priceFormatter.format(totalValue)}`, 14, y)
  y += 12

  doc.setFontSize(13)
  doc.text('Detalle de insumos', 14, y)
  y += 8
  drawTable(
    doc,
    y,
    ['Insumo', 'Stock actual', 'Stock mínimo', 'Estado'],
    supplies.map((s) => [
      s.name,
      `${s.currentStock} ${s.unit}`,
      `${s.minStock} ${s.unit}`,
      s.currentStock <= s.minStock ? 'Stock bajo' : s.status,
    ]),
    [70, 40, 40, 40],
  )

  doc.save(`exportacion-stock-${new Date().toISOString().slice(0, 10)}.pdf`)
}
