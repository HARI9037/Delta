// Reusable loading spinner
export default function Spinner() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}
