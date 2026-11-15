// Esqueleto de tabla: se muestra mientras llegan los datos, para que la página
// no muestre un "no hay resultados" falso ni salte al cargar.
export default function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="aura-table-wrap" aria-busy="true" aria-label="Cargando datos">
      <table className="aura-table table-skeleton">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, c) => (
              <th key={c}>
                <span className="skeleton" style={{ width: `${50 + ((c * 17) % 35)}%`, height: 10 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }, (_, c) => (
                <td key={c}>
                  <span
                    className="skeleton"
                    style={{ width: `${c === 0 ? 70 - ((r * 7) % 25) : 45 + ((r * 13 + c * 9) % 40)}%`, height: 12 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
