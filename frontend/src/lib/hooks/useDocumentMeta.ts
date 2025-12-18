// src/hooks/useDocumentMeta.ts
import { useEffect } from 'react'

interface MetaTag {
  name?: string
  property?: string
  content: string
}

interface MetaOptions {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: string
  lang?: string
  additionalMeta?: MetaTag[]
}

export const useDocumentMeta = ({
  title,
  description,
  keywords,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  lang = 'en',
  additionalMeta = [],
}: MetaOptions) => {
  useEffect(() => {
    // Set title
    document.title = title

    // Set HTML lang
    document.documentElement.lang = lang

    // Helper to update or create meta tag
    const setMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        const attr = selector.match(/\[(.+?)="(.+?)"\]/)
        if (attr) {
          element.setAttribute(attr[1], attr[2])
        }
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Set basic meta tags
    setMetaTag('meta[name="description"]', description)

    if (keywords) {
      setMetaTag('meta[name="keywords"]', keywords)
    }

    // Open Graph
    setMetaTag('meta[property="og:title"]', title)
    setMetaTag('meta[property="og:description"]', description)
    setMetaTag('meta[property="og:type"]', ogType)
    setMetaTag('meta[property="og:image"]', ogImage)

    // Twitter
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', title)
    setMetaTag('meta[name="twitter:description"]', description)
    setMetaTag('meta[name="twitter:image"]', ogImage)

    // Additional meta tags
    additionalMeta.forEach(meta => {
      if (meta.name) {
        setMetaTag(`meta[name="${meta.name}"]`, meta.content)
      } else if (meta.property) {
        setMetaTag(`meta[property="${meta.property}"]`, meta.content)
      }
    })
  }, [title, description, keywords, ogImage, ogType, lang, additionalMeta])
}
