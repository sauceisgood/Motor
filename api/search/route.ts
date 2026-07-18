import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const { query, site } = await request.json()
  let browser

  try {
    browser = await chromium.launch({
      headless: true
    })
    
    const page = await browser.newPage()
    const searchUrl = site === 'szwego' 
      ? `https://szwego.com/search?keyword=${encodeURIComponent(query)}`
      : `https://www.yupoo.com/search?key=${encodeURIComponent(query)}`

    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    })

    // Espera e extrai resultados
    await page.waitForTimeout(3000)
    
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.product-item, .item, .photo, [class*="product"], [class*="item"]')
      return Array.from(items).slice(0, 20).map(item => {
        const img = item.querySelector('img')
        const link = item.querySelector('a')
        const title = item.querySelector('.title, .name, [class*="title"]')
        return {
          title: title?.textContent?.trim() || img?.alt || 'Produto',
          image: img?.src || '',
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
