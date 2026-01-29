import React, { CSSProperties, useMemo } from 'react'
import DOMpurify from 'dompurify'

const style: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: 'white'
}

const disableLinksStyle = '<style>a { pointer-events: none; }</style>'

const getBaseTag = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    return `<base href="${parsedUrl.origin}/">`
  } catch {
    return ''
  }
}

export default function ExternalContent({
  content,
  baseUrl = '',
  allowScripts = false
}: {
  content: string
  baseUrl?: string
  allowScripts?: boolean
}) {
  const srcDoc = useMemo(() => {
    const baseTag = getBaseTag(baseUrl)
    const prefix = baseTag + disableLinksStyle
    if (allowScripts) {
      return prefix + content
    }
    return (
      prefix +
      DOMpurify.sanitize(content, {
        USE_PROFILES: { html: true },
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ['style', 'link', 'head']
      })
    )
  }, [content, baseUrl, allowScripts])

  const sandbox = allowScripts ? 'allow-scripts allow-same-origin' : 'allow-same-origin'
  return <iframe srcDoc={srcDoc} style={style} sandbox={sandbox} />
}
