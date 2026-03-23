import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Sidebar from '../../components/Sidebar'

const TYPE_BADGE = {
  TOP_UP:          'bg-green-100 text-green-700',
  P2P_TRANSFER:    'bg-blue-100 text-blue-700',
  UTILITY_PAYMENT: 'bg-orange-100 text-orange-700',
  GOVERNMENT_FEE:  'bg-purple-100 text-purple-700',
  REFUND:          'bg-teal-100 text-teal-700',
}

const STATUS_BADGE = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING:   'bg-amber-100 text-amber-700',
  FAILED:    'bg-red-100 text-red-700',
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reportMode, setReportMode] = useState(false)

  const fetchTransactions = () => {
    setLoading(true)
    if (reportMode && (from || to)) {
      const params = new URLSearchParams({ page, size: 50 })
      if (from) params.append('from', new Date(from).toISOString())
      if (to) params.append('to', new Date(to + 'T23:59:59').toISOString())
      api.get(`/admin/reports/transactions?${params}`)
        .then(({ data }) => {
          setTransactions(data.data)
          setTotalPages(0)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      api.get(`/admin/transactions?page=${page}&size=20&sort=createdAt,desc`)
        .then(({ data }) => {
          setTransactions(data.data.content)
          setTotalPages(data.data.totalPages)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => { fetchTransactions() }, [page])

  const handleReport = (e) => {
    e.preventDefault()
    setReportMode(true)
    setPage(0)
    fetchTransactions()
  }

  const clearReport = () => {
    setReportMode(false)
    setFrom('')
    setTo('')
    setPage(0)
    fetchTransactions()
  }

  const fmt = (amount) => Number(amount).toLocaleString('en-TZ', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">All platform transactions</p>
        </div>

        {/* Date filter */}
        <form onSubmit={handleReport} className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Run Report
          </button>
          {reportMode && (
            <button
              type="button"
              onClick={clearReport}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Clear
            </button>
          )}
          {reportMode && (
            <span className="text-xs text-indigo-600 font-medium py-2">
              Showing {transactions.length} results in range
            </span>
          )}
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Type', 'From', 'To', 'Amount', 'Status', 'Reference', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
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
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      No transactions found
                    </td>
                  </tr>
                ) : transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                      {tx.senderEmail || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                      {tx.recipientEmail || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {fmt(tx.amount)} <span className="text-xs font-normal text-gray-400">{tx.currency}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">
                      {tx.reference}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!reportMode && totalPages > 1 && (
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
