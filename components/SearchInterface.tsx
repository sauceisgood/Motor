'use client'

import { useState } from 'react'

interface Result {
  title: string
  image: string
  link: string
}

export default function SearchInterface() {
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
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), site: platform })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Erro na pesquisa')
      
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
    <div>
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Pesquisar produtos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        
        <select 
          className="platform-select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          disabled={loading}
        >
          <option value="szwego">Szwego</option>
          <option value="yupoo">Yupoo</option>
        </select>
        
        <button 
          className="search-button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? 'A pesquisar...' : 'Pesquisar'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      
      {loading && (
        <div className="loading">
          <div>⏳ A pesquisar em {platform === 'szwego' ? 'Szwego' : 'Yupoo'}...</div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
            A primeira pesquisa pode demorar alguns segundos
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div style={{ margin: '20px 0 10px', color: '#666' }}>
            Encontrados {results.length} resultados
          </div>
          <div className="results-grid">
            {results.map((result, index) => (
              <div key={index} className="result-card">
                {result.image && (
                  <img 
                    src={result.image} 
                    alt={result.title}
                    className="result-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  <a 
                    href={result.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="result-link"
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
  )
}
