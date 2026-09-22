export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-title">{title}</div>
      {description && <p>{description}</p>}
    </div>
  )
}
