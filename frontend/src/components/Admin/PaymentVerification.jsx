import { useEffect, useState } from 'react'
import {
  getAllPayments,
  verifyPayment,
  rejectPayment,
  getPaymentConfig,
  updatePaymentConfig,
} from '../../services/paymentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }) {
  const map = {
    Pending:  { bg: '#FEF3C7', color: '#92400E' },
    Uploaded: { bg: '#DBEAFE', color: '#1E40AF' },
    Verified: { bg: '#D1FAE5', color: '#065F46' },
    Rejected: { bg: '#FEE2E2', color: '#991B1B' },
  }
  const s = map[status] || map.Pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
      {status}
    </span>
  )
}

function ConfigModal({ config, onClose, onSaved }) {
  const [form, setForm] = useState({
    defaultAmount:        config.defaultAmount ?? 500,
    currency:             config.currency ?? 'INR',
    dueDay:               config.dueDay ?? 5,
    requiresVerification: config.requiresVerification ?? false,
    description:          config.description ?? 'Monthly Tuition Fee',
    instituteName:        config.instituteName ?? 'Delta Tutoring Centre',
    instituteAddress:     config.instituteAddress ?? 'India',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handle = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const save = async () => {
    setSaving(true)
    setErr('')
    try {
      await updatePaymentConfig(form)
      onSaved()
      onClose()
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)', padding: '1.2rem 1.5rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', letterSpacing: 1 }}>ADMINISTRATION</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>
              <i className="bi bi-gear-fill me-2" />Payment & Fee Configuration
            </div>
          </div>

          <div className="modal-body p-4">
            {err && <AlertMessage type="danger" message={err} />}

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Default Fee Amount</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={form.defaultAmount}
                  onChange={(e) => handle('defaultAmount', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">Currency</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.currency}
                  onChange={(e) => handle('currency', e.target.value.toUpperCase())}
                  maxLength={4}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">Due Day of Month</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={form.dueDay}
                  onChange={(e) => handle('dueDay', Number(e.target.value))}
                  min="1"
                  max="28"
                />
              </div>
              <div className="col-6 d-flex align-items-end pb-1">
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="reqVerification"
                    checked={form.requiresVerification}
                    onChange={(e) => handle('requiresVerification', e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="reqVerification">
                    Require Verification
                  </label>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Fee Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.description}
                  onChange={(e) => handle('description', e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Institute Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.instituteName}
                  onChange={(e) => handle('instituteName', e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Institute Address</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.instituteAddress}
                  onChange={(e) => handle('instituteAddress', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm px-4" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ payment, onClose }) {
  const student = payment.studentId
  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)', padding: '1.2rem 1.5rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', letterSpacing: 1 }}>DELTA TUTORING CENTRE</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>
              Fee Receipt — {payment.month} {payment.year}
            </div>
          </div>
          <div className="modal-body p-4" style={{ position: 'relative' }}>
            {payment.status === 'Verified' && (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 20,
                  border: '3px solid #22C55E',
                  borderRadius: 8,
                  padding: '3px 12px',
                  color: '#22C55E',
                  fontWeight: 800,
                  fontSize: '1rem',
                  transform: 'rotate(15deg)',
                  opacity: 0.8,
                  letterSpacing: 2,
                }}
              >
                PAID
              </div>
            )}

            <div style={{ borderTop: '2px dashed #E5E7EB', marginBottom: '1rem' }} />

            <DRow label="Receipt No." value={payment.receiptNumber || '—'} />
            <DRow label="Transaction ID" value={payment.transactionId || '—'} mono />
            <DRow label="Paid On" value={fmt(payment.paidAt)} />

            <div style={{ borderTop: '1px solid #F3F4F6', margin: '0.5rem 0' }} />

            <DRow label="Student Name" value={student?.name || '—'} />
            <DRow label="Class" value={student?.class || '—'} />
            <DRow label="School" value={student?.school || '—'} />
            <DRow label="Email" value={student?.email || '—'} />

            <div style={{ borderTop: '1px solid #F3F4F6', margin: '0.5rem 0' }} />

            <DRow label="Billing Period" value={`${payment.month} ${payment.year}`} />
            <DRow label="Description" value="Monthly Tuition Fee" />

            {payment.adminNote && <DRow label="Admin Note" value={payment.adminNote} />}

            <div style={{ borderTop: '2px dashed #E5E7EB', margin: '0.5rem 0' }} />

            <div
              className="d-flex justify-content-between align-items-center"
              style={{ background: 'rgba(11,23,78,0.05)', borderRadius: 10, padding: '0.65rem 0.9rem' }}
            >
              <span style={{ fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0B174E' }}>
                {payment.currency || 'INR'} {(payment.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-center mt-3">
              <StatusBadge status={payment.status} />
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DRow({ label, value, mono }) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>{label}</span>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          maxWidth: '60%',
          textAlign: 'right',
          wordBreak: 'break-all',
          fontFamily: mono ? 'monospace' : 'inherit',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function PaymentVerification() {
  const [payments, setPayments] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [viewPayment, setViewPayment] = useState(null)
  const [acting, setActing] = useState(null)

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pmtRes, cfgRes] = await Promise.all([getAllPayments(), getPaymentConfig()])
      setPayments(pmtRes.data?.data || [])
      setConfig(cfgRes.data?.data)
    } catch {
      setError('Failed to load payment records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleVerify = async (id) => {
    setActing(id)
    try {
      await verifyPayment(id, {})
      setSuccess('Payment verified successfully.')
      fetchAll()
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to verify payment.')
    } finally {
      setActing(null)
    }
  }

  const handleReject = async (id) => {
    setActing(id)
    try {
      await rejectPayment(id, {})
      setSuccess('Payment rejected.')
      fetchAll()
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to reject payment.')
    } finally {
      setActing(null)
    }
  }

  const filtered = payments.filter((p) => {
    const student = p.studentId
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    const matchSearch =
      !searchTerm ||
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  if (loading) return <Spinner />

  const total = payments.length
  const pending = payments.filter((p) => p.status === 'Pending').length
  const uploaded = payments.filter((p) => p.status === 'Uploaded').length
  const verified = payments.filter((p) => p.status === 'Verified').length
  const revenue = payments.filter((p) => p.status === 'Verified').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      <p className="page-title">Payment Verification & Management</p>
      <p className="page-subtitle">Review student payment records, verify transactions, and update fee settings.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Payments', value: total, color: 'stat-card-blue' },
          { label: 'Pending', value: pending, color: 'stat-card-yellow' },
          { label: 'Awaiting Verify', value: uploaded, color: 'stat-card-red' },
          { label: 'Verified', value: verified, color: 'stat-card-green' },
        ].map((s) => (
          <div key={s.label} className="col-sm-6 col-xl-3">
            <div className={`stat-card ${s.color} rounded-3`}>
              <div>
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <i className="bi bi-credit-card-fill" />
            </div>
          </div>
        ))}
      </div>

      {/* Fee Config Banner */}
      {config && (
        <div className="card mb-4" style={{ border: '1.5px dashed #0B174E', background: 'rgba(11,23,78,0.03)', borderRadius: 12 }}>
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div style={{ fontWeight: 700, color: '#0B174E' }}>
                <i className="bi bi-gear me-2" />Fee Settings
              </div>
              <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                Default Amount: <strong>{config.currency} {(config.defaultAmount || 0).toLocaleString('en-IN')}</strong>
                &nbsp;&bull;&nbsp; Due Day: <strong>Day {config.dueDay}</strong>
                &nbsp;&bull;&nbsp; Auto-verify: <strong>{config.requiresVerification ? 'OFF (Manual Verification)' : 'ON (Auto)'}</strong>
                &nbsp;&bull;&nbsp; Verified Revenue: <strong style={{ color: '#22C55E' }}>{config.currency} {revenue.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 8 }} onClick={() => setShowConfig(true)}>
              <i className="bi bi-pencil me-1" />Edit Fee Settings
            </button>
          </div>
        </div>
      )}

      {/* Filter Header */}
      <div className="card mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Uploaded">Uploaded (Awaiting Verification)</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2 text-muted small text-end">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-3">Student</th>
                  <th>Class</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Paid On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const s = p.studentId
                    const isActing = acting === p._id
                    return (
                      <tr key={p._id}>
                        <td className="px-3">
                          <div className="fw-semibold small">{s?.name || '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {s?.email || '—'}
                          </div>
                        </td>
                        <td className="small">{s?.class || '—'}</td>
                        <td className="small">
                          {p.month} {p.year}
                        </td>
                        <td className="small fw-semibold">
                          {p.currency || 'INR'} {(p.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="text-muted small">{fmt(p.paidAt)}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap align-items-center">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => setViewPayment(p)}
                            >
                              <i className="bi bi-receipt" />
                            </button>

                            {(p.status === 'Pending' || p.status === 'Uploaded' || p.status === 'Rejected') && (
                              <button
                                className="btn btn-sm btn-success"
                                style={{ fontSize: '0.72rem' }}
                                disabled={isActing}
                                onClick={() => handleVerify(p._id)}
                              >
                                {isActing ? '…' : '✓ Verify'}
                              </button>
                            )}

                            {p.status !== 'Rejected' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                style={{ fontSize: '0.72rem' }}
                                disabled={isActing}
                                onClick={() => handleReject(p._id)}
                              >
                                {isActing ? '…' : '✗ Reject'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConfig && config && <ConfigModal config={config} onClose={() => setShowConfig(false)} onSaved={fetchAll} />}
      {viewPayment && <DetailModal payment={viewPayment} onClose={() => setViewPayment(null)} />}
    </div>
  )
}
