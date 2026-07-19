import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 30

interface Product {
  title: string
  image: string
  link: string
}

async function searchSite(url: string): Promise<Product[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    return extractProducts(html)
  } catch (error) {
    console.error('Erro ao buscar:', error)
    return []
  }
}

function extractProducts(html: string): Product[] {
  const products: Product[] = []
  
  // Padrões para diferentes estruturas
  const patterns = [
    // Produtos com imagem e link
    /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<[^>]*class="[^"]*(?:title|name|product-name)[^"]*"[^>]*>([^<]*)<\/[^>]*>/gi,
    // Produtos sem título específico
    /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?(?:<[^>]*>)*([^<]*(?:Produto|Product|Item)[^<]*)</gi
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const link = match[1]?.startsWith('http') ? match[1] : `https:${match[1]}`
      const image = match[2]?.startsWith('http') ? match[2] : `https:${match[2]}`
      const title = match[3]?.trim() || 'Produto'
      
      if (link && link !== '#' && image) {
        products.push({
          title: title.substring(0, 100),
          image: image,
          link: link
        })
      }
    }
  }

  return products.slice(0, 30)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, site } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Termo de pesquisa inválido' },
        { status: 400 }
      )
    }

    if (!['szwego', 'yupoo'].includes(site)) {
      return NextResponse.json(
        { error: 'Plataforma inválida' },
        { status: 400 }
      )
    }

    console.log(`🔍 Pesquisando "${query}" em ${site}`)

    const searchUrl = site === 'szwego'
      ? `https://szwego.com/search?keyword=${encodeURIComponent(query)}`
      : `https://www.yupoo.com/search?key=${encodeURIComponent(query)}`

    const results = await searchSite(searchUrl)

    console.log(`✅ Encontrados ${results.length} resultados`)

    return NextResponse.json({
      success: true,
      results: results,
      count: results.length,
      query: query,
      site: site
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json(
      {
        error: 'Erro ao realizar pesquisa. Tenta novamente.',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}        const link = item.querySelector('a')
        const title = item.querySelector('.title, .name, [class*="title"], [class*="name"]')
        
        return {
          title: title?.textContent?.trim() || img?.alt || 'Produto Szwego',
          image: img?.src || '',
          link: link?.href || '#'
        }
      })
    })

    return results.filter(r => r.link !== '#')
  } finally {
    await browser.close()
  }
}

async function searchYupoo(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    const searchUrl = `https://www.yupoo.com/search?key=${encodeURIComponent(query)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 })

    await page.waitForSelector('.photo, .item, .pic, [class*="photo"]', { timeout: 15000 }).catch(() => {})

    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.photo, .item, .pic, [class*="photo"], [class*="item"]')
      return Array.from(items).slice(0, 30).map(item => {
        const img = item.querySelector('img')
        const link = item.querySelector('a')
        const title = item.querySelector('.title, .name, [class*="title"]')
        
        return {
          title: title?.textContent?.trim() || img?.alt || 'Produto Yupoo',
          image: img?.src || img?.getAttribute('data-src') || '',
          link: link?.href || '#'
        }
      })
    })

    return results.filter(r => r.link !== '#')
  } finally {
    await browser.close()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, site } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Termo de pesquisa inválido' },
        { status: 400 }
      )
    }

    if (!site || !['szwego', 'yupoo'].includes(site)) {
      return NextResponse.json(
        { error: 'Plataforma inválida' },
        { status: 400 }
      )
    }

    console.log(`🔍 Pesquisando "${query}" em ${site}`)

    const results = site === 'szwego' 
      ? await searchSzwego(query)
      : await searchYupoo(query)

    console.log(`✅ Encontrados ${results.length} resultados`)

    return NextResponse.json({ 
      success: true, 
      results,
      count: results.length 
    })

  } catch (error) {
    console.error('❌ Erro na pesquisa:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao realizar a pesquisa. Tenta novamente.' 
      },
      { status: 500 }
    )
  }
        }          image: img?.src || '',
          link: link?.href || '#'
        }
      })
    })

    await browser.close()
    
    return NextResponse.json({ 
      success: true, 
      results: results.filter(r => r.link !== '#')
    })

  } catch (error) {
    if (browser) await browser.close()
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro na pesquisa' },
      { status: 500 }
    )
  }
}
