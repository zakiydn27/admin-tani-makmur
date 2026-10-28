'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const supabase = createClient()

// ✅ Kategori yang SAMA PERSIS dengan web utama
const CATEGORIES = [
  'PEMBASMI HAMA GUDANG',
  'PEMBASMI NYAMUK LALAT',
  'PEMBASMI RAYAP',
  'PEMBASMI TIKUS',
  'ALAT PEMBASMI HAMA'
]

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'PEMBASMI HAMA GUDANG', // Default kategori pertama
    description: '',
    price: 0,
    stok: 0,
    features: '',
    image: '',
    pestTarget: '',
    formulation: '',
    packaging: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
      } else {
        setIsAuthenticated(true)
      }
    }
    checkUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stok' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== '')

    const productData = {
      id: `product-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: formData.price,
      stok: formData.stok,
      features: featuresArray,
      image: formData.image || 'https://via.placeholder.com/600x400',
      pest_target: formData.pestTarget,
      formulation: formData.formulation,
      packaging: formData.packaging,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()

    if (error) {
      alert('Gagal menambah produk: ' + error.message)
    } else {
      alert('Produk berhasil ditambahkan!')
      // Reset form dengan kategori default yang valid
      setFormData({
        name: '', 
        category: 'PEMBASMI HAMA GUDANG', 
        description: '', 
        price: 0, 
        stok: 0,
        features: '', 
        image: '', 
        pestTarget: '', 
        formulation: '', 
        packaging: ''
      })
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Memeriksa autentikasi...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Tambah Produk Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Nama Produk <span className="text-red-500">*</span></label>
              <input 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="Contoh: KACONG 500gr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Kategori <span className="text-red-500">*</span></label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all bg-white"
              >
                {/* ✅ Opsi Kategori yang Sudah Disinkronisasi */}
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Deskripsi <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              required 
              rows={8} 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all font-mono text-sm"
              placeholder={`**APA ITU NAMA PRODUK?**\n\nDeskripsi singkat produk di sini.\n\n**PANDUAN & CARA PENGGUNAAN**\n\n1. Cara penggunaan pertama\n2. Cara penggunaan kedua\n\n**COCOK DIAPLIKASIKAN PADA**\n\n✓ Hama pertama\n✓ Hama kedua`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan format: <code className="bg-gray-100 px-1 rounded text-green-700">**JUDUL**</code> untuk section, <code className="bg-gray-100 px-1 rounded text-green-700">1.</code> untuk list, <code className="bg-gray-100 px-1 rounded text-green-700">✓</code> untuk bullet
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="price" 
                required 
                value={formData.price} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Stok <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="stok" 
                required 
                value={formData.stok} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">URL Gambar</label>
              <input 
                type="url" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="https://..." 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Target Hama</label>
              <input 
                name="pestTarget" 
                value={formData.pestTarget} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="Cth: Kutu, Kumbang" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Formulasi</label>
              <input 
                name="formulation" 
                value={formData.formulation} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="Cth: Tablet, Cair" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Kemasan</label>
              <input 
                name="packaging" 
                value={formData.packaging} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
                placeholder="Cth: Kaleng 500gr" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Fitur Utama (Pisahkan dengan koma)</label>
            <input 
              name="features" 
              value={formData.features} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all" 
              placeholder="Efektif, Tahan lama, Mudah digunakan" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mt-4"
          >
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  )
}