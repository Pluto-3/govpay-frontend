import { useEffect, useState } from 'react'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'

const TYPE_ICONS = {
  WATER: '💧',
  ELECTRICITY: '⚡',
  TAX: '🏛',
  FINE: '🚔',
  GOVERNMENT_FEE: '📋',
  OTHER: '🔧',
}

const STATUS_STYLES = {
  UNPAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-50 text-gray-500 border-gray-200',
}

function ServiceCard({ service, onGenerate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
          {TYPE_ICONS[service.type] || '🔧'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{service.name}</p>
          <p className="text-xs text-gray-400">{service.providerName}</p>
        </div>
      </div>
      <button
        onClick={() => onGenerate(service)}
        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-indigo-700 transition font-medium"
      >
        Generate Bill
      </button>
    </div>
  )
}

function BillRow({ bill, onPay, paying }) {
  const due = new Date(bill.dueDate)
  const isOverdue = due < new Date() && bill.status === 'UNPAID'

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
          {TYPE_ICONS[bill.utilityService?.type] || '🔧'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {bill.utilityService?.name}
          </p>
          <p className="text-xs text-gray-400">
            Due {due.toLocaleDateString()}
            {isOverdue && <span className="text-red-500 ml-1">· Overdue</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            {Number(bill.amount).toLocaleString('en-TZ', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400">{bill.currency}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[bill.status]}`}>
          {bill.status}
        </span>
        {bill.status === 'UNPAID' || bill.status === 'OVERDUE' ? (
          <button
            onClick={() => onPay(bill.id)}
            disabled={paying === bill.id}
            className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 font-medium"
          >
            {paying === bill.id ? '...' : 'Pay'}
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>
    </div>
  )
}

export default function Bills() {
  const [services, setServices] = useState([])
  const [bills, setBills] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingBills, setLoadingBills] = useState(true)
  const [generating, setGenerating] = useState(null)
  const [paying, setPaying] = useState(null)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('bills')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.get('/utility/services')
      .then(({ data }) => setServices(data.data))
      .finally(() => setLoadingServices(false))

    fetchBills()
  }, [])

  const fetchBills = () => {
    setLoadingBills(true)
    api.get('/utility/bills')
      .then(({ data }) => setBills(data.data.content))
      .catch(console.error)
      .finally(() => setLoadingBills(false))
  }

  const handleGenerate = async (service) => {
    setGenerating(service.code)
    try {
      await api.post('/utility/bills/generate', { serviceCode: service.code })
      showToast(`${service.name} bill generated successfully`)
      setTab('bills')
      fetchBills()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate bill', 'error')
    } finally {
      setGenerating(null)
    }
  }

  const handlePay = async (billId) => {
    setPaying(billId)
    try {
      await api.post(`/utility/bills/${billId}/pay`)
      showToast('Bill paid successfully')
      fetchBills()
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed', 'error')
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Utility Bills</h1>
          <p className="text-gray-500 text-sm mt-1">Pay government and utility services</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="max-w-2xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
            {['bills', 'services'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'bills' ? 'My Bills' : 'Services'}
              </button>
            ))}
          </div>

          {/* Bills tab */}
          {tab === 'bills' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">My Bills</h2>
              {loadingBills ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
                        <div className="h-2.5 bg-gray-100 rounded w-20" />
                      </div>
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🧾</p>
                  <p className="text-sm">No bills yet</p>
                  <button
                    onClick={() => setTab('services')}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Generate a bill
                  </button>
                </div>
              ) : (
                bills.map(bill => (
                  <BillRow key={bill.id} bill={bill} onPay={handlePay} paying={paying} />
                ))
              )}
            </div>
          )}

          {/* Services tab */}
          {tab === 'services' && (
            <div className="space-y-3">
              {loadingServices ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
                      <div className="h-2.5 bg-gray-100 rounded w-48" />
                    </div>
                  </div>
                ))
              ) : (
                services.map(s => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onGenerate={handleGenerate}
                    generating={generating}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
