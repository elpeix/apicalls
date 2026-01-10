import React, { CSSProperties, useMemo } from 'react'
import DOMpurify from 'dompurify'

const style: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: 'white'
}

export default function ExternalContent({
  content,
  allowScripts = false
}: {
  content: string
  allowScripts?: boolean
}) {
  const srcDoc = useMemo(() => {
    if (allowScripts) {
      return content
    }
    return DOMpurify.sanitize(content, {
      USE_PROFILES: { html: true },
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ['style', 'link', 'head', 'script']
    })
  }, [content, allowScripts])

  const sandbox = allowScripts ? 'allow-scripts allow-same-origin' : 'allow-same-origin'
  return <iframe srcDoc={srcDoc} style={style} sandbox={sandbox} />
}
