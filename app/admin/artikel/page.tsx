'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  FileText,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'

const supabase = createClient()

interface Article {
  id: string
  title: string
  summary: string
  published_at: string
  category: string
  image: string
  created_at: string
}

export default function KelolaArtikelPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setArticles(data as Article[])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      const { error } = await supabase.from('articles').delete().eq('id', id)
      if (!error) {
        loadArticles()
      }
    }
  }

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="text-gray-500 mt-1">Kelola artikel dan tips pertanian</p>
        </div>
        <button
          onClick={() => router.push('/admin/artikel/add')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Artikel
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat artikel...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-500">Tidak ada artikel ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={article.image || 'https://via.placeholder.com/400x200'} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar size={14} />
                  {formatDate(article.published_at)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.summary}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/artikel/edit/${article.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}