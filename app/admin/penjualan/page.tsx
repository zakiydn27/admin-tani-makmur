'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { 
  ShoppingCart, 
  Filter, 
  Eye, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'

const supabase = createClient()

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  total_price: number
  status: string
  notes: string
  items: OrderItem[]
  tracking_number?: string
  created_at: string
}

export default function PenjualanPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, pendingOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])
  useEffect(() => { filterOrders() }, [orders, filterStatus, searchQuery])

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      const totalSales = (data || []).reduce((sum: number, order: Order) => sum + (order.total_price || 0), 0)
      const pendingOrders = (data || []).filter((o: Order) => o.status === 'pending').length

      setOrders(data || [])
      setStats({ totalSales, totalOrders: data?.length || 0, pendingOrders })
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_phone?.includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    }
    setFilteredOrders(filtered)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      fetchOrders()
      alert(`Status berhasil diupdate menjadi "${newStatus}"`)
    } catch (error) {
      alert('Gagal mengupdate status')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Memuat data...</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Penjualan</h1>
        <p className="text-gray-600 mt-1">Kelola semua order dan transaksi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-3 rounded-lg"><ShoppingCart className="w-6 h-6 text-white" /></div>
            <div>
              <div className="text-sm text-gray-600">Total Penjualan</div>
              <div className="text-xl font-bold text-gray-800">Rp {stats.totalSales.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg"><Package className="w-6 h-6 text-white" /></div>
            <div>
              <div className="text-sm text-gray-600">Total Order</div>
              <div className="text-xl font-bold text-gray-800">{stats.totalOrders}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-3 rounded-lg"><Clock className="w-6 h-6 text-white" /></div>
            <div>
              <div className="text-sm text-gray-600">Menunggu Konfirmasi</div>
              <div className="text-xl font-bold text-gray-800">{stats.pendingOrders}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {[
              { key: 'all', label: 'Semua', color: 'green' },
              { key: 'pending', label: 'Menunggu', color: 'yellow' },
              { key: 'processing', label: 'Diproses', color: 'blue' },
              { key: 'shipped', label: 'Dikirim', color: 'purple' },
              { key: 'completed', label: 'Selesai', color: 'green' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === item.key ? `bg-${item.color}-500 text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, no. HP, atau order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada order yang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Pelanggan</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm font-mono font-semibold text-gray-800">#{order.id.slice(0, 8)}</div>
                      {order.tracking_number && <div className="text-xs text-gray-500 mt-1">Resi: {order.tracking_number}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-800">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-gray-800">Rp {order.total_price?.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={order.status} /></td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => router.push(`/admin/penjualan/${order.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'processing')} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">Proses</button>
                        )}
                        {order.status === 'processing' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'shipped')} className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors">Kirim</button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">Selesai</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
  }
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}