cat > app/api/search/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { query, site } = await request.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Termo inválido' }, { status: 400 })
    }

    const url = site === 'szwego'
      ? `https://szwego.com/search?keyword=${encodeURIComponent(query)}`
      : `https://www.yupoo.com/search?key=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const html = await response.text()
    
    const results: any[] = []
    const regex = /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?(?:<[^>]*>)*([^<]*(?:[A-Za-zÀ-ÿ0-9\s]+))</g
    
    let match
    while ((match = regex.exec(html)) !== null) {
      const link = match[1]?.startsWith('http') ? match[1] : `https:${match[1]}`
      const image = match[2]?.startsWith('http') ? match[2] : `https:${match[2]}`
      const title = match[3]?.trim() || 'Produto'
      
      if (link && link !== '#' && image) {
        results.push({ title, image, link })
        if (results.length >= 30) break
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      count: results.length 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro na pesquisa' },
      { status: 500 }
    )
  }
}
EOF
