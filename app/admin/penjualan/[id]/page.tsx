'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { 
  ArrowLeft, Package, User, Phone, Mail, MapPin, FileText,
  Printer, Truck, CheckCircle, Clock, Copy, Check, X
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
  courier?: string
  created_at: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) fetchOrderDetail()
  }, [params.id])

  const fetchOrderDetail = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      setOrder(data)
      setTrackingNumber(data?.tracking_number || '')
      setCourier(data?.courier || '')
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await supabase.from('orders').update({ 
        status: newStatus,
        tracking_number: trackingNumber,
        courier: courier
      }).eq('id', order?.id)
      alert(`Status berhasil diupdate menjadi "${newStatus}"`)
      fetchOrderDetail()
    } catch (error) {
      alert('Gagal mengupdate status')
    }
  }

  const handleSaveTracking = async () => {
    try {
      await supabase.from('orders').update({ 
        tracking_number: trackingNumber,
        courier: courier
      }).eq('id', order?.id)
      alert('Nomor resi berhasil disimpan!')
      fetchOrderDetail()
    } catch (error) {
      alert('Gagal menyimpan nomor resi')
    }
  }

  const handleCopyTracking = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Memuat detail order...</div></div>
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order tidak ditemukan</p>
        <button onClick={() => router.push('/admin/penjualan')} className="mt-4 text-blue-600 hover:underline">Kembali ke Penjualan</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push('/admin/penjualan')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Detail Order</h1>
            <p className="text-gray-600 text-sm">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <button onClick={() => setShowPrintModal(true)} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          <Printer className="w-4 h-4" />
          <span>Cetak Resi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Informasi Pelanggan
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Nama</div>
                  <div className="font-medium text-gray-800">{order.customer_name}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">No. Telepon</div>
                  <div className="font-medium text-gray-800">{order.customer_phone}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-800">{order.customer_email}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Alamat Pengiriman</div>
                  <div className="font-medium text-gray-800">{order.customer_address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Produk yang Dipesan
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.quantity} x Rp {item.price?.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-green-600">Rp {order.total_price?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-500" />
                Catatan Pesanan
              </h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Update Status</h3>
            <div className="space-y-4 mb-6">
              <StatusStep status="pending" label="Menunggu Konfirmasi" current={order.status} icon={Clock} />
              <StatusStep status="processing" label="Sedang Diproses" current={order.status} icon={Package} />
              <StatusStep status="shipped" label="Dalam Pengiriman" current={order.status} icon={Truck} />
              <StatusStep status="completed" label="Selesai" current={order.status} icon={CheckCircle} />
            </div>
            <div className="space-y-2">
              {order.status === 'pending' && (
                <button onClick={() => handleUpdateStatus('processing')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">Tandai Diproses</button>
              )}
              {order.status === 'processing' && (
                <button onClick={() => handleUpdateStatus('shipped')} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors">Tandai Dikirim</button>
              )}
              {order.status === 'shipped' && (
                <button onClick={() => handleUpdateStatus('completed')} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">Tandai Selesai</button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nomor Resi</h3>
            {order.tracking_number ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500">Kurir</div>
                    <div className="font-medium text-gray-800">{order.courier || '-'}</div>
                  </div>
                  <button onClick={handleCopyTracking} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-green-600 mb-1">Nomor Resi</div>
                  <div className="font-mono font-bold text-green-800 text-lg">{order.tracking_number}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Kurir</label>
                  <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih Kurir</option>
                    <option value="JNE">JNE</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="AnterAja">AnterAja</option>
                    <option value="Ninja">Ninja Express</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Nomor Resi</label>
                  <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Masukkan nomor resi..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleSaveTracking} disabled={!trackingNumber || !courier} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors">Simpan Nomor Resi</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Order</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-gray-800">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal</span>
                <span className="text-gray-800">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu</span>
                <span className="text-gray-800">{new Date(order.created_at).toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPrintModal && <PrintReceiptModal order={order} onClose={() => setShowPrintModal(false)} />}
    </div>
  )
}

function StatusStep({ status, label, current, icon: Icon }: { status: string; label: string; current: string; icon: React.ComponentType<{ className?: string }> }) {
  const order = ['pending', 'processing', 'shipped', 'completed']
  const isCompleted = order.indexOf(current) >= order.indexOf(status)
  const isCurrent = current === status

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}>
        {isCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className={`flex-1 ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{label}</div>
      {isCurrent && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Saat Ini</span>}
    </div>
  )
}

function PrintReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Cetak Resi Pengiriman</h3>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrint} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-6 pb-6 border-b-2 border-gray-800">
            <h1 className="text-2xl font-bold text-gray-800">CV. TANI MAKMUR BERSAMA</h1>
            <p className="text-sm text-gray-600 mt-1">Distributor Pest Control Terpercaya</p>
            <p className="text-xs text-gray-500 mt-2">Telp: 0815-5071-697</p>
          </div>

          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Nomor Resi:</span>
                <span className="text-xl font-bold font-mono text-gray-800">{order.tracking_number || 'BELUM ADA'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kurir:</span>
                <span className="font-semibold text-gray-800">{order.courier || '-'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">PENGIRIM</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">CV. Tani Makmur Bersama</p>
                <p>0815-5071-697</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">PENERIMA</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{order.customer_name}</p>
                <p>{order.customer_address}</p>
                <p>{order.customer_phone}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-800 mb-3">DETAIL PRODUK</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2">Produk</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">Rp {item.price?.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800">
                  <td colSpan={3} className="text-right py-3 font-bold">TOTAL</td>
                  <td className="text-right py-3 font-bold text-lg">Rp {order.total_price?.toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>Terima kasih atas kepercayaan Anda!</p>
          </div>
        </div>
      </div>
    </div>
  )
}