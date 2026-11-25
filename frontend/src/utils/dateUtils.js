/**
 * Safe date utilities that prevent UTC timezone shift (off-by-one day bugs)
 */

export function getTodayLocalDateStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatLocalDate(dateStr, options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '—'
  if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.includes('T')) {
    const parts = dateStr.split('-').map(Number)
    if (parts.length === 3 && !parts.some(isNaN)) {
      const [y, m, d] = parts
      const localDt = new Date(y, m - 1, d)
      return localDt.toLocaleDateString(undefined, options)
    }
  }
  return new Date(dateStr).toLocaleDateString(undefined, options)
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
