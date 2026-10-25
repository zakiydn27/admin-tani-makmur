'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const supabase = createClient()

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const [formData, setFormData] = useState({
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
      setFormData({
        name: '', category: 'PEMBASMI HAMA GUDANG', description: '', price: 0, stok: 0,
        features: '', image: '', pestTarget: '', formulation: '', packaging: ''
      })
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memeriksa autentikasi...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tambah Produk Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Nama Produk</label>
              <input 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Kategori</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900"
              >
                <option value="PEMBASMI HAMA GUDANG">PEMBASMI HAMA GUDANG</option>
                <option value="PEMBASMI HAMA PERTANIAN">PEMBASMI HAMA PERTANIAN</option>
                <option value="PEMBASMI HAMA RUMAH TANGGA">PEMBASMI HAMA RUMAH TANGGA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Deskripsi</label>
            <textarea 
              name="description" 
              required 
              rows={4} 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-2 text-gray-900" 
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Harga (Rp)</label>
              <input 
                type="number" 
                name="price" 
                required 
                value={formData.price} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Stok</label>
              <input 
                type="number" 
                name="stok" 
                required 
                value={formData.stok} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">URL Gambar</label>
              <input 
                type="url" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
                placeholder="https://..." 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="description" 
              required 
              rows={8} 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all font-mono text-sm"
              placeholder={`**APA ITU NAMA PRODUK?**\n\nDeskripsi singkat produk di sini.\n\n**PANDUAN & CARA PENGGUNAAN**\n\n1. Cara penggunaan pertama\n2. Cara penggunaan kedua\n3. Cara penggunaan ketiga\n\n**COCOK DIAPLIKASIKAN PADA**\n\n✓ Hama pertama\n✓ Hama kedua\n✓ Hama ketiga`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan format: <code className="bg-gray-100 px-1 rounded">**JUDUL**</code> untuk membuat section, <code className="bg-gray-100 px-1 rounded">1.</code> untuk list bernomor, <code className="bg-gray-100 px-1 rounded">✓</code> untuk bullet list
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Target Hama</label>
              <input 
                name="pestTarget" 
                value={formData.pestTarget} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
                placeholder="Cth: Kutu, Kumbang" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Formulasi</label>
              <input 
                name="formulation" 
                value={formData.formulation} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
                placeholder="Cth: Tablet, Cair" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Kemasan</label>
              <input 
                name="packaging" 
                value={formData.packaging} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
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
              className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              placeholder="Efektif, Tahan lama, Mudah digunakan" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  )
}