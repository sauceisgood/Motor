'use client'

import { useState } from 'react'

interface Result {
  title: string
  image: string
  link: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('szwego')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(), 
          site: platform 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro na pesquisa')
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results)
      } else {
        setError('Nenhum resultado encontrado')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao pesquisar')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '40px'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#1a1a2e',
          marginBottom: '30px',
          fontSize: '2.5rem'
        }}>
          🔍 Szwego & Yupoo Search
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              minWidth: '200px'
            }}
          />
          
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={loading}
            style={{
              padding: '15px 20px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              background: 'white',
              minWidth: '150px'
            }}
          >
            <option value="szwego">Szwego</option>
            <option value="yupoo">Yupoo</option>
          </select>
          
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            style={{
              padding: '15px 40px',
              background: loading || !query.trim() ? '#ccc' : '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ A pesquisar...' : '🔍 Pesquisar'}
          </button>
        </div>

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#e74c3c',
            background: '#fde8e8',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            ❌ {error}
          </div>
        )}
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div>⏳ A pesquisar em {platform === 'szwego' ? 'Szwego' : 'Yupoo'}...</div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
              A procurar resultados...
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div style={{ margin: '20px 0 10px', color: '#666' }}>
              📦 Encontrados {results.length} resultados
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {results.map((result, index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                  border: '1px solid #eee'
                }}>
                  {result.image && (
                    <img 
                      src={result.image} 
                      alt={result.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        background: '#f5f5f5'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div style={{ padding: '15px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#1a1a2e',
                      marginBottom: '10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {result.title}
                    </div>
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        color: '#4a90e2',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Ver produto →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
