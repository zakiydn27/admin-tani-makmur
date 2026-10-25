'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { createClient } from '@/lib/supabaseClient'

const supabase = createClient()

interface ChartData {
  name: string
  penjualan: number
}

interface BarChartData {
  name: string
  sales: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPenjualan: 0,
    totalOrder: 0,
    totalProduk: 0,
    totalPelanggan: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    const { count: produkCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    const mockChartData: ChartData[] = [
      { name: 'Sen', penjualan: 4000000 },
      { name: 'Sel', penjualan: 3000000 },
      { name: 'Rab', penjualan: 5000000 },
      { name: 'Kam', penjualan: 4500000 },
      { name: 'Jum', penjualan: 6000000 },
      { name: 'Sab', penjualan: 7000000 },
      { name: 'Min', penjualan: 5500000 },
    ]

    setStats({
      totalPenjualan: 35000000,
      totalOrder: orderCount || 0,
      totalProduk: produkCount || 0,
      totalPelanggan: 12
    })
    setChartData(mockChartData)
    setLoading(false)
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(angka)
  }

  const statCards = [
    {
      title: 'Total Penjualan',
      value: formatRupiah(stats.totalPenjualan),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Order',
      value: stats.totalOrder.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Produk',
      value: stats.totalProduk.toString(),
      change: '+2',
      trend: 'up',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Pelanggan',
      value: stats.totalPelanggan.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: Users,
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, Admin!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Penjualan Mingguan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value) => formatRupiah(Number(value))}
              />
              <Line 
                type="monotone" 
                dataKey="penjualan" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Phostoxin', sales: 45 },
              { name: 'Silamda', sales: 38 },
              { name: 'Regent', sales: 32 },
              { name: 'Furadan', sales: 28 },
              { name: 'Decis', sales: 25 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { id: 'ORD-001', customer: 'Budi Santoso', total: 250000, status: 'Selesai', date: '21 Okt 2026' },
                { id: 'ORD-002', customer: 'Siti Aminah', total: 180000, status: 'Diproses', date: '21 Okt 2026' },
                { id: 'ORD-003', customer: 'Ahmad Rizki', total: 320000, status: 'Dikirim', date: '20 Okt 2026' },
              ].map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatRupiah(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                      order.status === 'Diproses' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}