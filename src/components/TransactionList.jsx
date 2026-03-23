import { useEffect, useState } from 'react'
import api from '../api/axios'

const TYPE_LABELS = {
  TOP_UP: { label: 'Top Up', color: 'text-green-600 bg-green-50' },
  P2P_TRANSFER: { label: 'Transfer', color: 'text-blue-600 bg-blue-50' },
  UTILITY_PAYMENT: { label: 'Utility', color: 'text-orange-600 bg-orange-50' },
  GOVERNMENT_FEE: { label: 'Gov Fee', color: 'text-purple-600 bg-purple-50' },
  REFUND: { label: 'Refund', color: 'text-green-600 bg-green-50' },
}

function TxRow({ tx, walletId }) {
  const isCredit = tx.recipientWalletId === walletId
  const meta = TYPE_LABELS[tx.type] || { label: tx.type, color: 'text-gray-600 bg-gray-50' }
  const date = new Date(tx.createdAt)

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
          isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
        }`}>
          {isCredit ? '↙' : '↗'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 truncate">
              {tx.description || meta.label}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-gray-800'}`}>
          {isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString('en-TZ', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
          })}
        </p>
        <p className="text-xs text-gray-400">{tx.currency}</p>
      </div>
    </div>
  )
}

export default function TransactionList({ walletId, refresh }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (!walletId) return
    setLoading(true)
    api.get(`/wallet/transactions?page=${page}&size=10`)
      .then(({ data }) => {
        setTransactions(data.data.content)
        setTotalPages(data.data.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [walletId, page, refresh])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
              <div className="h-2.5 bg-gray-100 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm">No transactions yet</p>
      </div>
    )
  }

  return (
    <div>
      <div>
        {transactions.map(tx => (
          <TxRow key={tx.id} tx={tx} walletId={walletId} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="text-sm text-gray-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="text-sm text-gray-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
