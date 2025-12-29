import { useEffect } from 'react'

interface MetaProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  lang?: string
}

export function useDocumentMeta({
  title,
  description,
  keywords,
  ogImage = '/Logo.png',
  ogUrl,
  lang = 'en',
}: MetaProps) {
  useEffect(() => {
    document.title = title
    document.documentElement.lang = lang
    const updateMetaTag = (
      selector: string,
      content: string,
      attributeName: 'name' | 'property' = 'name'
    ) => {
      let element = document.querySelector(selector) as HTMLMetaElement

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(
          attributeName,
          selector.match(/["']([^"']+)["']/)?.[1] || ''
        )
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    const fullImageUrl = ogImage?.startsWith('http')
      ? ogImage
      : `${window.location.origin}${ogImage}`

    const currentUrl = ogUrl || window.location.href

    updateMetaTag('meta[name="description"]', description, 'name')

    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords, 'name')
    }

    updateMetaTag('meta[property="og:title"]', title, 'property')
    updateMetaTag('meta[property="og:description"]', description, 'property')
    updateMetaTag('meta[property="og:image"]', fullImageUrl, 'property')
    updateMetaTag('meta[property="og:url"]', currentUrl, 'property')
    updateMetaTag('meta[property="og:type"]', 'website', 'property')

    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image', 'name')
    updateMetaTag('meta[name="twitter:title"]', title, 'name')
    updateMetaTag('meta[name="twitter:description"]', description, 'name')
    updateMetaTag('meta[name="twitter:image"]', fullImageUrl, 'name')
  }, [title, description, keywords, ogImage, ogUrl, lang])
}
