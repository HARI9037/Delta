import { useEffect, useState } from 'react'
import { getPayments, getPaymentStatus, demoPayNow } from '../../services/paymentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

// ─────────────────────────────────────────────────────────────────────────────
// Helper to format dates
// ─────────────────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Pending:  'badge-pending',
    Uploaded: 'badge-uploaded',
    Verified: 'badge-verified',
    Rejected: 'badge-rejected',
  }
  return <span className={`badge ${map[status] || 'badge-pending'} px-2 py-1`}>{status}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini receipt modal (read-only view of a past payment)
// ─────────────────────────────────────────────────────────────────────────────
function ReceiptModal({ payment, student, onClose }) {
  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 16, overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)', padding: '1.4rem 1.8rem 1.1rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', letterSpacing: 1 }}>DELTA TUTORING CENTRE</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Official Fee Receipt</div>
          </div>

          <div className="modal-body p-4" style={{ position: 'relative' }}>
            {/* Stamp */}
            {payment.status === 'Verified' && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                border: '3px solid #22C55E', borderRadius: 8,
                padding: '3px 12px', color: '#22C55E', fontWeight: 800,
                fontSize: '1rem', transform: 'rotate(15deg)', opacity: 0.8, letterSpacing: 2,
              }}>PAID</div>
            )}
            {payment.status === 'Rejected' && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                border: '3px solid #EF4444', borderRadius: 8,
                padding: '3px 12px', color: '#EF4444', fontWeight: 800,
                fontSize: '1rem', transform: 'rotate(15deg)', opacity: 0.8, letterSpacing: 2,
              }}>REJECTED</div>
            )}

            <div style={{ borderTop: '2px dashed #E5E7EB', margin: '0 -1rem 1rem' }} />

            {/* Receipt number + date */}
            <div className="d-flex justify-content-between mb-3">
              <div>
                <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Receipt No.</div>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0B174E' }}>{payment.receiptNumber || '—'}</div>
              </div>
              <div className="text-end">
                <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Paid On</div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{fmt(payment.paidAt)}</div>
              </div>
            </div>

            <Row label="Student Name"  value={student?.name || '—'} />
            <Row label="Class"         value={student?.class || '—'} />
            <Row label="School"        value={student?.school || '—'} />
            <Row label="Email"         value={student?.email || '—'} />

            <div style={{ borderTop: '1px solid #F3F4F6', margin: '0.6rem 0' }} />

            <Row label="Billing Period"   value={`${payment.month} ${payment.year}`} />
            <Row label="Description"      value="Monthly Tuition Fee" />
            <Row label="Payment Method"   value="Demo Payment" />
            <Row label="Transaction ID"   value={payment.transactionId || '—'} mono />

            {payment.adminNote && <Row label="Admin Note" value={payment.adminNote} />}

            <div style={{ borderTop: '2px dashed #E5E7EB', margin: '0.6rem 0' }} />

            <div className="d-flex justify-content-between align-items-center"
              style={{ background: 'rgba(11,23,78,0.05)', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
              <span style={{ fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0B174E' }}>
                {payment.currency || 'INR'} {(payment.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-center mt-2">
              <StatusBadge status={payment.status} />
            </div>
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={onClose}>Close</button>
          </div>

          <div style={{ background: '#F9FAFB', padding: '0.6rem 1.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#9CA3AF' }}>
            This is a demo receipt — no real money was charged.
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="d-flex justify-content-between mb-2" style={{ alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Payments Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Payments() {
  const [payments, setPayments]           = useState([])
  const [currentPayment, setCurrentPayment] = useState(null)
  const [student, setStudent]             = useState(null)
  const [loading, setLoading]             = useState(true)
  const [paying, setPaying]               = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')
  const [viewReceipt, setViewReceipt]     = useState(null) // payment to show in modal

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statusRes, historyRes] = await Promise.all([getPaymentStatus(), getPayments()])
      const { payment: p, student: s } = statusRes.data?.data || {}
      setCurrentPayment(p)
      setStudent(s)
      setPayments(historyRes.data?.data || [])
    } catch {
      setError('Failed to load payment data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handlePayNow = async () => {
    setError('')
    setPaying(true)
    try {
      const res = await demoPayNow()
      const { payment: p, student: s } = res.data?.data || {}
      setCurrentPayment(p)
      setStudent(s)
      setSuccess('Payment successful! Your receipt is ready.')
      localStorage.setItem('tms_payment_last_paid', String(Date.now()))
      fetchAll()
      setTimeout(() => setSuccess(''), 6000)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <Spinner />

  const isPaid = currentPayment?.status === 'Verified' || currentPayment?.status === 'Uploaded'
  const now = new Date()
  const currentMonth = now.toLocaleString('default', { month: 'long' })
  const currentYear  = String(now.getFullYear())

  return (
    <div>
      <p className="page-title">Payments</p>
      <p className="page-subtitle">Manage your monthly tuition fee payments.</p>

      <AlertMessage type="danger"  message={error} />
      <AlertMessage type="success" message={success} />

      {/* ── Current Month Card ── */}
      {currentPayment && (
        <div className="card mb-4" style={{ borderRadius: 14, overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(11,23,78,0.1)' }}>
          {/* Card top banner */}
          <div style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)', padding: '1.2rem 1.5rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.73rem', letterSpacing: 1 }}>CURRENT MONTH PAYMENT</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: 2 }}>
              {currentPayment.month} {currentPayment.year}
            </div>
          </div>

          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left: Receipt details */}
              <div className="col-md-7 p-4" style={{ borderRight: '1px solid #F3F4F6' }}>
                <div style={{ borderTop: '2px dashed #E5E7EB', marginBottom: '1rem' }} />

                <Row label="Student Name"  value={student?.name || '—'} />
                <Row label="Class"         value={student?.class || '—'} />
                <Row label="School"        value={student?.school || '—'} />

                <div style={{ borderTop: '1px solid #F3F4F6', margin: '0.5rem 0' }} />

                <Row label="Description"   value="Monthly Tuition Fee" />
                <Row label="Billing Period" value={`${currentPayment.month} ${currentPayment.year}`} />
                <Row label="Payment Method" value="Demo Payment" />

                {isPaid && <>
                  <Row label="Receipt No."   value={currentPayment.receiptNumber || '—'} />
                  <Row label="Transaction ID" value={currentPayment.transactionId || '—'} mono />
                  <Row label="Paid On"       value={fmt(currentPayment.paidAt)} />
                </>}
              </div>

              {/* Right: Amount & action */}
              <div className="col-md-5 p-4 d-flex flex-column align-items-center justify-content-center text-center">
                <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Amount Due</div>
                <div style={{ fontWeight: 800, fontSize: '2rem', color: '#0B174E', lineHeight: 1.2 }}>
                  {currentPayment.currency || 'INR'} {(currentPayment.amount || 0).toLocaleString('en-IN')}
                </div>

                <div className="my-2">
                  <StatusBadge status={currentPayment.status} />
                </div>

                {!isPaid ? (
                  <button
                    className="btn btn-primary mt-3 px-4 py-2 w-100"
                    onClick={handlePayNow}
                    disabled={paying}
                    style={{ borderRadius: 10, fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    {paying ? '⏳ Processing…' : `Pay ${currentPayment.currency || 'INR'} ${(currentPayment.amount || 0).toLocaleString('en-IN')}`}
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-secondary mt-3 px-4 w-100"
                    style={{ borderRadius: 10, fontSize: '0.85rem' }}
                    onClick={() => setViewReceipt(currentPayment)}
                  >
                    <i className="bi bi-receipt me-2" />View Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment History Table ── */}
      <div className="card">
        <div className="card-header">
          <i className="bi bi-clock-history me-2 text-primary" />Payment History
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-3">Receipt No.</th>
                  <th>Month / Year</th>
                  <th>Amount</th>
                  <th>Paid On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id}>
                      <td className="px-3 small" style={{ fontFamily: 'monospace' }}>{p.receiptNumber || '—'}</td>
                      <td className="fw-semibold small">{p.month} {p.year}</td>
                      <td className="small">{p.currency || 'INR'} {(p.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="text-muted small">{fmt(p.paidAt)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {(p.status === 'Verified' || p.receiptNumber) ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setViewReceipt(p)}
                          >
                            <i className="bi bi-receipt me-1" />Receipt
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {viewReceipt && (
        <ReceiptModal
          payment={viewReceipt}
          student={student}
          onClose={() => setViewReceipt(null)}
        />
      )}
    </div>
  )
}
