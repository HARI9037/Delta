// Displays an error or success message using Bootstrap alert
export default function AlertMessage({ type = 'danger', message }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type} py-2 small`} role="alert">
      {message}
    </div>
  )
}
