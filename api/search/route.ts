import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const runtime = 'nodejs'
export const maxDuration = 30

interface Product {
  title: string
  image: string
  link: string
}

async function searchSzwego(query: string): Promise<Product[]> {
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
    
    const searchUrl = `https://szwego.com/search?keyword=${encodeURIComponent(query)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 })

    // Aguarda os resultados
    await page.waitForSelector('.product-item, .item, .product', { timeout: 15000 }).catch(() => {})

    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.product-item, .item, .product, [class*="product"]')
      return Array.from(items).slice(0, 30).map(item => {
        const img = item.querySelector('img')
        const link = item.querySelector('a')
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
