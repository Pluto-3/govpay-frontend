import { useState } from 'react'
import api from '../api/axios'

export default function TopUpModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const quickAmounts = [5000, 10000, 20000, 50000]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const raw = Math.round(parseFloat(amount) * 100)
    if (!raw || raw < 100) {
      setError('Minimum top-up is 1.00 TZS')
      return
    }
    setLoading(true)
    try {
      await api.post('/wallet/top-up', {
        amount: raw,
        reference: `TOPUP-${Date.now()}`,
        description: 'Wallet top-up',
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Top-up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Top Up Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (TZS)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {quickAmounts.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className="py-1.5 text-xs border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition"
              >
                {q.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Processing...' : 'Top Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
