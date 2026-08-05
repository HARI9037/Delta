import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPaymentStatus, demoPayNow } from '../../services/paymentService'

// ─────────────────────────────────────────────────────────────────────────────
// PaymentGate
// Wraps all student pages. If the student hasn't paid this month it shows a
// full-screen, non-dismissable payment modal. After a successful "Pay Now" the
// modal disappears and localStorage is updated so it won't re-appear for 30 days
// (unless the DB says the current month is still Pending).
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tms_payment_last_paid'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ReceiptStamp({ status }) {
  if (status === 'Verified') {
    return (
      <div style={{
        position: 'absolute', top: 18, right: 18,
        border: '3px solid #22C55E', borderRadius: 8,
        padding: '4px 14px', color: '#22C55E', fontWeight: 800,
        fontSize: '1.1rem', transform: 'rotate(15deg)',
        opacity: 0.85, letterSpacing: 2, pointerEvents: 'none',
      }}>
        PAID
      </div>
    )
  }
  if (status === 'Uploaded') {
    return (
      <div style={{
        position: 'absolute', top: 18, right: 18,
        border: '3px solid #F59E0B', borderRadius: 8,
        padding: '4px 10px', color: '#F59E0B', fontWeight: 800,
        fontSize: '0.95rem', transform: 'rotate(15deg)',
        opacity: 0.85, letterSpacing: 2, pointerEvents: 'none',
      }}>
        PENDING
      </div>
    )
  }
  return null
}

export default function PaymentGate({ children }) {
  const { user, logout } = useAuth()
  const isStudent = user?.role === 'student'

  const [checking, setChecking]     = useState(true)   // loading state
  const [showGate, setShowGate]     = useState(false)   // show modal?
  const [payment, setPayment]       = useState(null)    // current month payment doc
  const [student, setStudent]       = useState(null)    // student profile
  const [paying, setPaying]         = useState(false)   // Pay Now loading
  const [paid, setPaid]             = useState(false)   // show success receipt
  const [error, setError]           = useState('')

  // ── Check whether the gate should show ──────────────────────────
  const checkPayment = useCallback(async () => {
    if (!isStudent) { setChecking(false); return }

    try {
      // Fast local check first
      const lastPaid = localStorage.getItem(STORAGE_KEY)
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
      const locallyValid = lastPaid && (Date.now() - Number(lastPaid)) < thirtyDaysMs

      // Always verify against DB (can't trust localStorage alone)
      const res = await getPaymentStatus()
      const { payment: p, student: s } = res.data?.data || {}

      setPayment(p)
      setStudent(s)

      const dbPaid = p?.status === 'Verified' || p?.status === 'Uploaded'

      if (dbPaid && locallyValid) {
        setShowGate(false)
      } else if (dbPaid && !locallyValid) {
        // DB says paid this month — refresh local cache
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
        setShowGate(false)
      } else {
        // Not paid — show gate
        setShowGate(true)
      }
    } catch {
      // If fetch fails, fall back to localStorage
      const lastPaid = localStorage.getItem(STORAGE_KEY)
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
      if (lastPaid && (Date.now() - Number(lastPaid)) < thirtyDaysMs) {
        setShowGate(false)
      } else {
        setShowGate(true)
      }
    } finally {
      setChecking(false)
    }
  }, [isStudent])

  useEffect(() => { checkPayment() }, [checkPayment])

  // ── Pay Now handler ──────────────────────────────────────────────
  const handlePayNow = async () => {
    setError('')
    setPaying(true)
    try {
      const res = await demoPayNow()
      const { payment: p, student: s } = res.data?.data || {}
      setPayment(p)
      setStudent(s)
      setPaid(true)
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const handleContinue = () => setShowGate(false)

  // ── Render ────────────────────────────────────────────────────────
  if (!isStudent || checking) return children

  return (
    <>
      {children}

      {showGate && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11,23,78,0.82)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
          }}>
            {/* ── Header ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0B174E, #25233F)',
              padding: '1.5rem 2rem 1.2rem',
              position: 'relative',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', letterSpacing: 1 }}>
                DELTA TUTORING CENTRE
              </div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginTop: 4 }}>
                {paid ? '✅ Payment Successful' : '💳 Monthly Fee Due'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: 2 }}>
                {paid
                  ? 'Your receipt is ready. You can continue using the app.'
                  : 'Please complete your payment to continue using all features.'}
              </div>
            </div>

            {/* ── Receipt Body ── */}
            <div style={{ padding: '1.5rem 2rem', position: 'relative' }}>
              {/* Stamp */}
              {paid && <ReceiptStamp status={payment?.status} />}

              {/* Dashed separator line */}
              <div style={{
                borderTop: '2px dashed #E5E7EB',
                margin: '0 -2rem 1.2rem',
              }} />

              {/* Receipt header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Receipt No.</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B174E', fontFamily: 'monospace' }}>
                    {paid ? payment?.receiptNumber : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Date & Time</div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
                    {paid ? formatDate(payment?.paidAt) : formatDate(new Date())}
                  </div>
                </div>
              </div>

              {/* Student details */}
              <ReceiptRow label="Student Name"   value={student?.name || '—'} />
              <ReceiptRow label="Class"          value={student?.class || '—'} />
              <ReceiptRow label="School"         value={student?.school || '—'} />
              <ReceiptRow label="Email"          value={student?.email || '—'} />

              <div style={{ borderTop: '1px solid #F3F4F6', margin: '0.75rem 0' }} />

              <ReceiptRow label="Billing Period" value={`${payment?.month || '—'} ${payment?.year || ''}`} />
              <ReceiptRow label="Description"    value="Monthly Tuition Fee" />
              <ReceiptRow label="Payment Method" value="Demo Payment" />

              {paid && (
                <ReceiptRow label="Transaction ID" value={payment?.transactionId || '—'} mono />
              )}

              <div style={{ borderTop: '2px dashed #E5E7EB', margin: '0.75rem 0' }} />

              {/* Amount */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: paid ? 'rgba(34,197,94,0.07)' : 'rgba(11,23,78,0.05)',
                borderRadius: 10, padding: '0.75rem 1rem',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                  Total Amount Due
                </span>
                <span style={{
                  fontWeight: 800, fontSize: '1.4rem',
                  color: paid ? '#16a34a' : '#0B174E',
                }}>
                  {payment?.currency || 'INR'} {(payment?.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Status badge */}
              <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                <StatusBadge status={payment?.status} />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: '0.8rem', padding: '0.6rem 0.9rem',
                  background: '#FEE2E2', borderRadius: 8,
                  color: '#991B1B', fontSize: '0.82rem',
                }}>
                  {error}
                </div>
              )}

              {/* ── Actions ── */}
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paid ? (
                  <button
                    onClick={handleContinue}
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #16a34a)',
                      color: '#fff', border: 'none', borderRadius: 10,
                      padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.95rem',
                      cursor: 'pointer', width: '100%',
                      boxShadow: '0 4px 14px rgba(34,197,94,0.4)',
                    }}
                  >
                    🎉 Continue to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    style={{
                      background: paying
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #0B174E, #0C1B5A)',
                      color: '#fff', border: 'none', borderRadius: 10,
                      padding: '0.85rem 1.5rem', fontWeight: 700, fontSize: '1rem',
                      cursor: paying ? 'not-allowed' : 'pointer', width: '100%',
                      boxShadow: '0 4px 18px rgba(11,23,78,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {paying ? (
                      <span>
                        <span style={{ marginRight: 8, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                        Processing…
                      </span>
                    ) : (
                      `Pay ${payment?.currency || 'INR'} ${(payment?.amount || 0).toLocaleString('en-IN')} Now`
                    )}
                  </button>
                )}

                {/* Logout escape hatch */}
                {!paid && (
                  <button
                    onClick={() => { logout(); window.location.href = '/login' }}
                    style={{
                      background: 'transparent', color: '#6B7280',
                      border: '1px solid #E5E7EB', borderRadius: 10,
                      padding: '0.6rem 1rem', fontSize: '0.82rem',
                      cursor: 'pointer', width: '100%',
                    }}
                  >
                    Sign out instead
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              background: '#F9FAFB', padding: '0.75rem 2rem',
              textAlign: 'center', fontSize: '0.7rem', color: '#9CA3AF',
              borderTop: '1px solid #F3F4F6',
            }}>
              This is a demo payment — no real money is charged.
              Contact admin if you have any questions.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Small helper components ───────────────────────────────────────────────────

function ReceiptRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.78rem', color: '#6B7280', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: '0.82rem', fontWeight: 600, color: '#111827',
        textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    Pending:  { bg: '#FEF3C7', color: '#92400E', label: 'Pending Payment' },
    Uploaded: { bg: '#DBEAFE', color: '#1E40AF', label: 'Awaiting Verification' },
    Verified: { bg: '#D1FAE5', color: '#065F46', label: 'Verified ✓' },
    Rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  }
  const s = map[status] || map.Pending
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: '3px 14px',
      fontSize: '0.75rem', fontWeight: 700, display: 'inline-block',
    }}>
      {s.label}
    </span>
  )
}
