'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
    
const supabase = createClient()

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notFound, setNotFound] = useState(false)

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

  // Cek autentikasi
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

  // Load data produk
  useEffect(() => {
    if (!isAuthenticated || !productId) return

    const loadProduct = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Konversi features array ke string untuk input
      const featuresString = Array.isArray(data.features) 
        ? data.features.join(', ') 
        : ''

      setFormData({
        name: data.name || '',
        category: data.category || 'PEMBASMI HAMA GUDANG',
        description: data.description || '',
        price: data.price || 0,
        stok: data.stok || 0,
        features: featuresString,
        image: data.image || '',
        pestTarget: data.pest_target || '',
        formulation: data.formulation || '',
        packaging: data.packaging || ''
      })
      setLoading(false)
    }

    loadProduct()
  }, [isAuthenticated, productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stok' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Konversi string fitur ke array
    const featuresArray = formData.features
      .split(',')
      .map(f => f.trim())
      .filter(f => f !== '')

    const productData = {
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
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)

    if (error) {
      alert('Gagal mengupdate produk: ' + error.message)
    } else {
      alert('Produk berhasil diupdate!')
      router.push('/admin/produk')
    }
    setSaving(false)
  }

  // Loading state
  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-500">Memuat data produk...</p>
        </div>
      </div>
    )
  }

  // Produk tidak ditemukan
  if (notFound) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Produk yang Anda cari tidak ada atau sudah dihapus.</p>
          <button
            onClick={() => router.push('/admin/produk')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header dengan tombol kembali */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Produk</h2>
            <p className="text-sm text-gray-500">Perbarui informasi produk</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama & Kategori */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                >
                  <option value="PEMBASMI HAMA GUDANG">PEMBASMI HAMA GUDANG</option>
                  <option value="PEMBASMI HAMA PERTANIAN">PEMBASMI HAMA PERTANIAN</option>
                  <option value="PEMBASMI HAMA RUMAH TANGGA">PEMBASMI HAMA RUMAH TANGGA</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description" 
                required 
                rows={5} 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                placeholder="Deskripsi lengkap produk..."
              />
            </div>

            {/* Harga, Stok, Gambar */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="price" 
                  required 
                  min="0"
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="stok" 
                  required 
                  min="0"
                  value={formData.stok} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gambar
                </label>
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

            {/* Preview Gambar */}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview Gambar</label>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img 
                    src={formData.image} 
                    alt="Preview"
                    className="max-h-48 mx-auto rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Target Hama, Formulasi, Kemasan */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Hama
                </label>
                <input 
                  name="pestTarget" 
                  value={formData.pestTarget} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  placeholder="Cth: Kutu, Kumbang"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formulasi
                </label>
                <input 
                  name="formulation" 
                  value={formData.formulation} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  placeholder="Cth: Tablet, Cair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kemasan
                </label>
                <input 
                  name="packaging" 
                  value={formData.packaging} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  placeholder="Cth: Kaleng 500gr"
                />
              </div>
            </div>

            {/* Fitur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fitur Utama
              </label>
              <input 
                name="features" 
                value={formData.features} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                placeholder="Efektif, Tahan lama, Mudah digunakan"
              />
              <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma (,)</p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Simpan Perubahan
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/produk')}
                className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}