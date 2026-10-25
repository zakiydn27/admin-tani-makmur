'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const supabase = createClient()

export default function AddArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    publishedAt: '',
    author: '',
    category: 'Artikel Edukasi',
    image: ''
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const articleData = {
      id: `tips-${Date.now()}`,
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      published_at: formData.publishedAt || new Date().toISOString().split('T')[0],
      author: formData.author,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/600x400'
    }

    const { error } = await supabase.from('articles').insert([articleData])

    if (error) {
      alert('Gagal menambah artikel: ' + error.message)
    } else {
      alert('Artikel berhasil ditambahkan!')
      router.push('/admin/artikel')
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Memeriksa autentikasi...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tambah Artikel Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Judul Artikel</label>
            <input 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-2 text-gray-900" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Ringkasan</label>
            <textarea 
              name="summary" 
              required 
              rows={2} 
              value={formData.summary} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-2 text-gray-900" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Konten Lengkap</label>
            <textarea 
              name="content" 
              required 
              rows={8} 
              value={formData.content} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-2 text-gray-900" 
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tanggal Publish</label>
              <input 
                type="date" 
                name="publishedAt" 
                value={formData.publishedAt} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Penulis</label>
              <input 
                name="author" 
                required 
                value={formData.author} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Kategori</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded p-2 text-gray-900"
              >
                <option value="Artikel Edukasi">Artikel Edukasi</option>
                <option value="Rekomendasi Basmi Hama">Rekomendasi Basmi Hama</option>
                <option value="Tips Pertanian">Tips Pertanian</option>
              </select>
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? 'Menyimpan...' : 'Simpan Artikel'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/artikel')}
              className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded hover:bg-gray-300"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}