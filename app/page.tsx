cat > app/page.tsx << 'EOF'
'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('szwego')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), site: platform })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro na pesquisa')
      
      setResults(data.results || [])
      if (data.results?.length === 0) {
        setError('Nenhum resultado encontrado')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao pesquisar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center' }}>🔍 Busca Szwego & Yupoo</h1>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && search()}
          style={{ flex: 1, padding: 12, border: '2px solid #ddd', borderRadius: 8 }}
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{ padding: 12, border: '2px solid #ddd', borderRadius: 8 }}
        >
          <option value="szwego">Szwego</option>
          <option value="yupoo">Yupoo</option>
        </select>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          style={{
            padding: '12px 30px',
            background: loading || !query.trim() ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳' : '🔍'}
        </button>
      </div>

      {error && <div style={{ color: 'red', textAlign: 'center', padding: 20 }}>{error}</div>}
      
      {loading && <div style={{ textAlign: 'center', padding: 40 }}>⏳ A pesquisar...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {results.map((item, i) => (
          <div key={i} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            {item.image && (
              <img 
                src={item.image} 
                alt={item.title}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
                onError={(e) => (e.target as any).style.display = 'none'}
              />
            )}
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>{item.title}</div>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#0070f3', textDecoration: 'none', fontSize: 13 }}
              >
                Ver →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
EOF
