'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Truck,
  X
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
  created_at: string
  tracking_number?: string
}

interface WeeklyData {
  date: string
  total: number
  count: number
}

interface TopProduct {
  name: string
  quantity: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [weeklySales, setWeeklySales] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    const channel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, 
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: products } = await supabase
        .from('products')
        .select('*')

      const totalSales = (orders || []).reduce((sum: number, order: Order) => sum + (order.total_price || 0), 0)
      const totalOrders = orders?.length || 0
      const totalProducts = products?.length || 0
      
      const uniqueCustomers = new Set((orders || []).map((o: Order) => o.customer_email))
      const totalCustomers = uniqueCustomers.size
      const pendingOrders = (orders || []).filter((o: Order) => o.status === 'pending').length

      setStats({ totalSales, totalOrders, totalProducts, totalCustomers, pendingOrders })
      setRecentOrders((orders || []).slice(0, 5))

      const productSales: Record<string, TopProduct> = {} as Record<string, TopProduct>
      (orders || []).forEach((order: Order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: OrderItem) => {
            if (productSales[item.name]) {
              productSales[item.name].quantity += item.quantity
            } else {
              productSales[item.name] = { name: item.name, quantity: item.quantity }
            }
          })
        }
      })

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
      setTopProducts(topProductsList)

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split('T')[0]
      })

      const weeklyData = last7Days.map(date => {
        const dayOrders = (orders || []).filter((o: Order) => o.created_at?.startsWith(date))
        const dayTotal = dayOrders.reduce((sum: number, o: Order) => sum + (o.total_price || 0), 0)
        return { date, total: dayTotal, count: dayOrders.length }
      })
      setWeeklySales(weeklyData)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Penjualan" value={`Rp ${stats.totalSales.toLocaleString('id-ID')}`} icon={DollarSign} color="green" trend="+12.5%" trendUp={true} />
        <StatCard title="Total Order" value={stats.totalOrders.toString()} icon={ShoppingCart} color="blue" trend="+8.2%" trendUp={true} />
        <StatCard title="Total Produk" value={stats.totalProducts.toString()} icon={Package} color="purple" trend="+2" trendUp={true} />
        <StatCard title="Total Pelanggan" value={stats.totalCustomers.toString()} icon={Users} color="orange" trend="-3.1%" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Penjualan Mingguan</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {weeklySales.map((day, idx) => {
              const maxTotal = Math.max(...weeklySales.map(d => d.total), 1)
              const height = (day.total / maxTotal) * 100
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">Rp {(day.total / 1000).toFixed(0)}k</div>
                  <div className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600" style={{ height: `${height}%` }} />
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Produk Terlaris</h3>
          {topProducts.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Belum ada data penjualan</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, idx) => {
                const maxQty = Math.max(...topProducts.map(p => p.quantity), 1)
                const width = (product.quantity / maxQty) * 100
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{product.name}</span>
                      <span className="text-gray-500">{product.quantity} terjual</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Order Terbaru</h3>
          <a href="/admin/penjualan" className="text-sm text-blue-600 hover:underline">Lihat Semua →</a>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Belum ada order</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Pelanggan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-800">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">Rp {order.total_price?.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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

function StatCard({ title, value, icon: Icon, color, trend, trendUp }: { 
  title: string; value: string; icon: React.ComponentType<{ className?: string }>; 
  color: 'green' | 'blue' | 'purple' | 'orange'; trend: string; trendUp: boolean 
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trend}
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}