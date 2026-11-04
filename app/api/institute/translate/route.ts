import { NextRequest, NextResponse } from 'next/server'

async function translateSingle(text: string, targetLang: 'hi' | 'en'): Promise<string> {
  if (!text || !text.trim()) return text

  const langPair = targetLang === 'hi' ? 'en|hi' : 'hi|en'
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    const data = await res.json()
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText
    }
  } catch (err) {
    console.error('Translation API error:', err)
  }

  return text
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, texts, targetLang = 'hi' } = body

    if (Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(t => translateSingle(t, targetLang))
      )
      return NextResponse.json({ success: true, translatedTexts: results })
    }

    if (typeof text === 'string') {
      const translated = await translateSingle(text, targetLang)
      return NextResponse.json({ success: true, translatedText: translated })
    }

    return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 })
  } catch (error: any) {
    console.error('Translate route error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Translation failed' }, { status: 500 })
  }
}

