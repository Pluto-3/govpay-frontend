export default function WalletCard({ wallet, onTopUp, onTransfer, loading }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-navy to-primary rounded-2xl p-6 text-white animate-pulse">
        <div className="h-4 bg-white/20 rounded w-24 mb-4" />
        <div className="h-10 bg-white/20 rounded w-40 mb-6" />
        <div className="flex gap-3">
          <div className="h-10 bg-white/20 rounded-lg flex-1" />
          <div className="h-10 bg-white/20 rounded-lg flex-1" />
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="bg-gradient-to-br from-navy to-primary rounded-2xl p-6 text-white">
        <p className="text-white/60 text-sm mb-4">No wallet yet</p>
        <p className="text-white/80 text-sm">Your wallet will be created automatically.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-navy to-primary rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between mb-1">
        <p className="text-white/60 text-sm">Available balance</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          wallet.status === 'ACTIVE'
            ? 'bg-green-400/20 text-green-300'
            : 'bg-red-400/20 text-red-300'
        }`}>
          {wallet.status}
        </span>
      </div>

      <p className="text-4xl font-bold tracking-tight mb-1">
        {Number(wallet.balance).toLocaleString('en-TZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </p>
      <p className="text-white/50 text-sm mb-6">{wallet.currency}</p>

      <div className="flex gap-3">
        <button
          onClick={onTopUp}
          disabled={wallet.status !== 'ACTIVE'}
          className="flex-1 bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          + Top Up
        </button>
        <button
          onClick={onTransfer}
          disabled={wallet.status !== 'ACTIVE'}
          className="flex-1 bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          ↗ Transfer
        </button>
      </div>
    </div>
  )
}
