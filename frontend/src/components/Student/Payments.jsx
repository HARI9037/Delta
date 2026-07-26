import { useEffect, useState } from 'react'
import { getPayments, uploadReceipt } from '../../services/paymentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

function StatusBadge({ status }) {
  const badgeClass = {
    Pending: 'badge-pending',
    Uploaded: 'badge-uploaded',
    Verified: 'badge-verified',
    Rejected: 'badge-rejected',
  }[status] || 'badge-pending'

  return <span className={`badge ${badgeClass} px-2 py-1`}>{status}</span>
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedPayment, setSelectedPayment] = useState(null)
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchPayments = () => {
    setLoading(true)
    getPayments()
      .then((res) => setPayments(res.data?.data || []))
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleUpload = async () => {
    if (!receiptUrl.trim()) { setError('Please enter a valid receipt URL'); return }
    setError('')
    setUploading(true)
    try {
      await uploadReceipt({ paymentId: selectedPayment._id, receiptUrl })
      setSuccess('Receipt uploaded successfully. Awaiting admin verification.')
      setSelectedPayment(null)
      setReceiptUrl('')
      fetchPayments() // refresh
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt')
    } finally {
      setUploading(false)
    }
  }

  if (loading && payments.length === 0) return <Spinner />

  return (
    <div>
      <p className="page-title">Payments</p>
      <p className="page-subtitle">Manage your monthly tuition fee payments.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-3">Month/Year</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id}>
                      <td className="px-3 py-3 fw-semibold small">{p.month} {p.year}</td>
                      <td className="small">PKR {p.amount}</td>
                      <td className="text-muted small">{p.dueDate?.split('T')[0] || '-'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {p.status === 'Pending' || p.status === 'Rejected' ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => { setSelectedPayment(p); setError(''); setReceiptUrl('') }}
                          >
                            Upload Receipt
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-light text-muted" style={{ fontSize: '0.75rem' }} disabled>
                            Submitted
                          </button>
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

      {/* Upload Modal */}
      {selectedPayment && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: 12 }}>
              <div className="modal-header bg-primary text-white" style={{ borderRadius: '12px 12px 0 0' }}>
                <h6 className="modal-title m-0"><i className="bi bi-cloud-arrow-up me-2"></i>Upload Receipt</h6>
                <button className="btn-close btn-close-white" onClick={() => setSelectedPayment(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 text-center">
                  <p className="small text-muted mb-1">Payment for</p>
                  <h5 className="fw-bold">{selectedPayment.month} {selectedPayment.year}</h5>
                  <p className="text-primary fw-semibold mb-0">PKR {selectedPayment.amount}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Receipt Image URL</label>
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="https://example.com/receipt.jpg"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Provide a valid image URL of your payment receipt.</small>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedPayment(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm px-4" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
