import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Sidebar from '../../components/Sidebar'

function StatCard({ label, value, sub, color = 'bg-white' }) {
  return (
    <div className={`${color} border border-gray-100 rounded-2xl p-5`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => Number(n || 0).toLocaleString('en-TZ', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
                <div className="h-7 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : stats && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Users</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total users" value={stats.totalUsers} />
              <StatCard label="Active" value={stats.activeUsers} color="bg-green-50" />
              <StatCard label="Suspended" value={stats.suspendedUsers} color="bg-red-50" />
              <StatCard label="KYC approved" value={stats.approvedKyc}
                sub={`${stats.pendingKyc} pending`} color="bg-blue-50" />
            </div>

            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Wallets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total wallets" value={stats.totalWallets} />
              <StatCard label="Total balance" value={`${fmt(stats.totalWalletBalance)} TZS`} />
            </div>

            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Transactions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total transactions" value={stats.totalTransactions} />
              <StatCard label="Completed" value={stats.completedTransactions} color="bg-green-50" />
              <StatCard label="Failed" value={stats.failedTransactions} color="bg-red-50" />
              <StatCard label="Total volume" value={`${fmt(stats.totalVolume)} TZS`} />
              <StatCard label="Top-up volume" value={`${fmt(stats.totalTopUpVolume)} TZS`} />
              <StatCard label="Transfer volume" value={`${fmt(stats.totalTransferVolume)} TZS`} />
              <StatCard label="Utility volume" value={`${fmt(stats.totalUtilityVolume)} TZS`} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
