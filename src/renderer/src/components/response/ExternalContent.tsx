import React, { CSSProperties, useState, useEffect } from 'react'
import DOMpurify from 'dompurify'

const style: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none'
}

export default function ExternalContent({
  content,
  allowScripts = false
}: {
  content: string
  allowScripts?: boolean
}) {
  const [srcDoc, setSrcDoc] = useState('')
  useEffect(() => {
    if (allowScripts) {
      setSrcDoc(content)
      return
    }
    setSrcDoc(
      DOMpurify.sanitize(content, {
        USE_PROFILES: { html: true },
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ['style', 'link', 'head', 'script']
      })
    )
  }, [content, allowScripts])
  const sandbox = allowScripts ? 'allow-scripts allow-same-origin' : 'allow-same-origin'
  return <iframe srcDoc={srcDoc} style={style} sandbox={sandbox} />
}
