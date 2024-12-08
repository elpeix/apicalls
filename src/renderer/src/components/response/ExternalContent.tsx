import React, { CSSProperties, useState, useEffect } from 'react'
import DOMpurify from 'dompurify'

const style: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: 'white'
}

export default function ExternalContent({ content }: { content: string }) {
  const [srcDoc, setSrcDoc] = useState('')
  useEffect(() => {
    setSrcDoc(
      DOMpurify.sanitize(content, {
        USE_PROFILES: { html: true },
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ['style', 'link', 'head']
      })
    )
  }, [content])
  return <iframe srcDoc={srcDoc} style={style} sandbox="allow-same-origin" />
}
