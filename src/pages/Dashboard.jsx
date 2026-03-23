import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import WalletCard from '../components/WalletCard'
import TopUpModal from '../components/TopUpModal'
import TransferModal from '../components/TransferModal'
import TransactionList from '../components/TransactionList'

export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet')
      setWallet(data.data)
    } catch (err) {
      // 404 means wallet doesn't exist yet — create it
      if (err.response?.status === 404) {
        try {
          const { data } = await api.post('/wallet')
          setWallet(data.data)
        } catch {
          // ignore
        }
      }
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => { fetchWallet() }, [])

  const handleSuccess = () => {
    fetchWallet()
    setRefresh(r => r + 1)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good day, {user?.firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your wallet overview
          </p>
        </div>

        <div className="max-w-2xl">
          {/* Wallet card */}
          <div className="mb-8">
            <WalletCard
              wallet={wallet}
              loading={walletLoading}
              onTopUp={() => setShowTopUp(true)}
              onTransfer={() => setShowTransfer(true)}
            />
          </div>

          {/* KYC banner */}
          {user?.kycStatus === 'PENDING' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Identity not verified</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Complete KYC verification to unlock all features.{' '}
                  <a href="/kyc" className="underline font-medium">Verify now</a>
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          {wallet && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Balance', value: `${Number(wallet.balance).toLocaleString('en-TZ', { minimumFractionDigits: 2 })} TZS` },
                { label: 'Currency', value: wallet.currency },
                { label: 'Status', value: wallet.status },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Transaction history */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Recent transactions
            </h2>
            <TransactionList walletId={wallet?.id} refresh={refresh} />
          </div>
        </div>
      </main>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showTransfer && (
        <TransferModal
          onClose={() => setShowTransfer(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
