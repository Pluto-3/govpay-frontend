import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Sidebar from '../../components/Sidebar'

const KYC_BADGE = {
  PENDING:   'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
}

const STATUS_BADGE = {
  ACTIVE:    'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  DELETED:   'bg-gray-100 text-gray-500',
}

const WALLET_BADGE = {
  ACTIVE: 'bg-green-100 text-green-700',
  FROZEN: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = () => {
    setLoading(true)
    api.get(`/admin/users?page=${page}&size=15&sort=createdAt,desc`)
      .then(({ data }) => {
        setUsers(data.data.content)
        setTotalPages(data.data.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page])

  const action = async (endpoint, userId, label) => {
    setActionLoading(userId + label)
    try {
      await api.patch(`/admin/users/${userId}/${endpoint}`)
      showToast(`${label} successful`)
      fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.error || `${label} failed`, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all platform users</p>
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

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['User', 'Role', 'Status', 'KYC', 'Wallet', 'Balance', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KYC_BADGE[user.kycStatus]}`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.walletStatus ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WALLET_BADGE[user.walletStatus]}`}>
                          {user.walletStatus}
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">
                        {user.walletBalance != null
                          ? `${Number(user.walletBalance).toLocaleString('en-TZ', { minimumFractionDigits: 2 })} TZS`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.walletStatus === 'ACTIVE' && (
                          <button
                            onClick={() => action('freeze', user.id, 'Freeze')}
                            disabled={actionLoading === user.id + 'Freeze'}
                            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                          >
                            Freeze
                          </button>
                        )}
                        {user.walletStatus === 'FROZEN' && (
                          <button
                            onClick={() => action('unfreeze', user.id, 'Unfreeze')}
                            disabled={actionLoading === user.id + 'Unfreeze'}
                            className="text-xs px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                          >
                            Unfreeze
                          </button>
                        )}
                        {user.status === 'ACTIVE' && (
                          <button
                            onClick={() => action('suspend', user.id, 'Suspend')}
                            disabled={actionLoading === user.id + 'Suspend'}
                            className="text-xs px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'SUSPENDED' && (
                          <button
                            onClick={() => action('reinstate', user.id, 'Reinstate')}
                            disabled={actionLoading === user.id + 'Reinstate'}
                            className="text-xs px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                          >
                            Reinstate
                          </button>
                        )}
                      </div>
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
      </main>
    </div>
  )
}
