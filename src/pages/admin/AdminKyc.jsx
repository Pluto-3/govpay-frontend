import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Sidebar from '../../components/Sidebar'

const DOC_LABELS = {
  NATIONAL_ID: 'National ID',
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's License",
  VOTERS_CARD: 'Voters Card',
  RESIDENCE_PERMIT: 'Residence Permit',
}

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selected, setSelected] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('pending')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSubmissions = () => {
    setLoading(true)
    const endpoint = tab === 'pending' ? '/kyc/admin/pending' : '/kyc/admin/all'
    api.get(`${endpoint}?page=${page}&size=15`)
      .then(({ data }) => {
        setSubmissions(data.data.content)
        setTotalPages(data.data.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubmissions() }, [page, tab])

  const handleApprove = async (docId) => {
    setActionLoading(docId + 'approve')
    try {
      await api.post(`/kyc/admin/${docId}/approve`)
      showToast('KYC approved successfully')
      setSelected(null)
      fetchSubmissions()
    } catch (err) {
      showToast(err.response?.data?.error || 'Approval failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (docId) => {
    if (!rejectReason.trim()) {
      showToast('Please enter a rejection reason', 'error')
      return
    }
    setActionLoading(docId + 'reject')
    try {
      await api.post(`/kyc/admin/${docId}/reject`, { reason: rejectReason })
      showToast('KYC rejected')
      setSelected(null)
      setRejectReason('')
      fetchSubmissions()
    } catch (err) {
      showToast(err.response?.data?.error || 'Rejection failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const STATUS_BADGE = {
    PENDING:  'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">KYC Review</h1>
          <p className="text-gray-500 text-sm mt-1">Review and action identity submissions</p>
        </div>

        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {['pending', 'all'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'pending' ? 'Pending Review' : 'All Submissions'}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* List */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['User', 'Document', 'Number', 'Submitted', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                        No {tab === 'pending' ? 'pending' : ''} submissions
                      </td>
                    </tr>
                  ) : submissions.map(doc => (
                    <tr
                      key={doc.id}
                      onClick={() => { setSelected(doc); setRejectReason('') }}
                      className={`border-b border-gray-50 cursor-pointer transition ${
                        selected?.id === doc.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{doc.userFullName}</p>
                        <p className="text-xs text-gray-400">{doc.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {DOC_LABELS[doc.documentType] || doc.documentType}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {doc.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[doc.status]}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="text-sm text-gray-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-400">Page {page + 1} of {totalPages}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-gray-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 bg-white rounded-2xl border border-gray-100 p-5 h-fit flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Review</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  ['Name', selected.userFullName],
                  ['Email', selected.userEmail],
                  ['Document', DOC_LABELS[selected.documentType] || selected.documentType],
                  ['Number', selected.documentNumber],
                  ['Submitted', new Date(selected.submittedAt).toLocaleDateString()],
                  selected.notes && ['Notes', selected.notes],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-gray-800 font-medium break-all">{value}</p>
                  </div>
                ))}
              </div>

              {selected.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    disabled={actionLoading === selected.id + 'approve'}
                    className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
                  >
                    {actionLoading === selected.id + 'approve' && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Approve
                  </button>

                  <div className="mb-2">
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                      placeholder="Rejection reason (required)"
                    />
                  </div>
                  <button
                    onClick={() => handleReject(selected.id)}
                    disabled={actionLoading === selected.id + 'reject'}
                    className="w-full py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selected.id + 'reject' && (
                      <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    Reject
                  </button>
                </>
              )}

              {selected.status !== 'PENDING' && (
                <div className={`p-3 rounded-xl text-sm ${
                  selected.status === 'APPROVED'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <p className="font-medium mb-1">
                    {selected.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </p>
                  {selected.rejectionReason && (
                    <p className="text-xs">{selected.rejectionReason}</p>
                  )}
                  {selected.reviewedBy && (
                    <p className="text-xs mt-1 opacity-70">by {selected.reviewedBy}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
