import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'

const STATUS_CONFIG = {
  PENDING: {
    icon: '📋',
    title: 'Not Verified',
    desc: 'Submit your identity documents to unlock all GovPay features.',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
  },
  SUBMITTED: {
    icon: '⏳',
    title: 'Under Review',
    desc: 'Your documents have been submitted and are being reviewed. This usually takes up to 24 hours.',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  APPROVED: {
    icon: '✅',
    title: 'Verified',
    desc: 'Your identity has been verified. You have full access to all GovPay features.',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  REJECTED: {
    icon: '❌',
    title: 'Rejected',
    desc: 'Your submission was rejected. Please review the reason and resubmit.',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
}

const DOC_TYPES = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'VOTERS_CARD', label: 'Voters Card' },
  { value: 'RESIDENCE_PERMIT', label: 'Residence Permit' },
]

export default function Kyc() {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ documentType: 'NATIONAL_ID', documentNumber: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const kycStatus = user?.kycStatus || 'PENDING'
  const config = STATUS_CONFIG[kycStatus]

  useEffect(() => {
    api.get('/kyc/status')
      .then(({ data }) => setStatus(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/kyc/submit', form)
      setSuccess('Documents submitted successfully. We will review within 24 hours.')
      // Refresh status
      const { data } = await api.get('/kyc/status')
      setStatus(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = kycStatus === 'PENDING' || kycStatus === 'REJECTED'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Complete KYC to unlock all features</p>
        </div>

        <div className="max-w-lg">
          {/* Status card */}
          <div className={`border rounded-2xl p-5 mb-6 ${config.color}`}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{config.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-gray-900">{config.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                    {kycStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{config.desc}</p>

                {/* Rejection reason */}
                {kycStatus === 'REJECTED' && status?.latestDocument?.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-700 mb-1">Rejection reason:</p>
                    <p className="text-xs text-red-600">{status.latestDocument.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Latest submission info */}
          {status?.latestDocument && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Latest Submission</h3>
              <div className="space-y-2">
                {[
                  ['Document type', DOC_TYPES.find(d => d.value === status.latestDocument.documentType)?.label || status.latestDocument.documentType],
                  ['Document number', status.latestDocument.documentNumber],
                  ['Submitted', new Date(status.latestDocument.submittedAt).toLocaleDateString()],
                  status.latestDocument.reviewedAt && ['Reviewed', new Date(status.latestDocument.reviewedAt).toLocaleDateString()],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission form */}
          {canSubmit && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {kycStatus === 'REJECTED' ? 'Resubmit Documents' : 'Submit Documents'}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Provide a valid government-issued identity document.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document type
                  </label>
                  <select
                    value={form.documentType}
                    onChange={set('documentType')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {DOC_TYPES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document number
                  </label>
                  <input
                    type="text"
                    required
                    value={form.documentNumber}
                    onChange={set('documentNumber')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. 19921234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Any additional information..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </form>
            </div>
          )}

          {/* Approved state */}
          {kycStatus === 'APPROVED' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-base font-semibold text-gray-900 mb-1">You're all set!</p>
              <p className="text-sm text-gray-500">
                Your identity has been verified. Enjoy full access to GovPay.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
