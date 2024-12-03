import React, { useContext, useEffect, useRef, useState } from 'react'
import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import { AppContext } from '../../context/AppContext'
import { RequestContext } from '../../context/RequestContext'

const base = window || global
const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

export default function Editor({
  language = 'json',
  value,
  readOnly = true,
  wordWrap,
  onChange
}: {
  language: string
  value: string
  readOnly?: boolean
  wordWrap?: boolean
  onChange?: OnChange
}) {
  const { appSettings } = useContext(AppContext)
  const requestContext = useContext(RequestContext)
  const [theme, setTheme] = useState(matchMedia.matches ? 'vs-dark' : 'vsi-light')
  const editorRef = useRef<Monaco | null>(null)

  useEffect(() => {
    const editorTheme = appSettings?.getEditorTheme()
    if (!editorTheme) {
      return
    }
    if (editorTheme.data && Object.keys(editorTheme.data).length > 0 && editorTheme.data.colors) {
      const monaco = editorRef.current
      if (monaco) {
        monaco.editor.defineTheme(editorTheme.name, editorTheme.data)
        monaco.editor.setTheme(editorTheme.name)
      }
      setTheme(editorTheme.name)
    } else {
      setTheme(editorTheme.mode === 'dark' ? 'vs-dark' : 'vs-light')
    }
  }, [requestContext.isActive, value, appSettings])

  return requestContext.isActive ? (
    <RenderEditor
      language={language}
      value={value}
      editorRef={editorRef}
      readOnly={readOnly}
      wordWrap={wordWrap || false}
      theme={theme}
      onChange={onChange}
    />
  ) : (
    <></>
  )
}

function RenderEditor({
  language,
  value,
  editorRef,
  readOnly,
  wordWrap,
  onChange,
  theme
}: {
  language: string
  value: string
  editorRef: React.MutableRefObject<Monaco | null>
  readOnly: boolean
  wordWrap: boolean
  onChange?: OnChange
  theme: string
}) {
  return (
    <MonacoEditor
      defaultLanguage={language}
      language={language}
      onChange={onChange}
      theme={theme}
      height="100%"
      width="100%"
      value={value}
      onMount={(_, monaco) => {
        editorRef.current = monaco
      }}
      options={{
        minimap: {
          enabled: false
        },
        //commandPalette: false,
        acceptSuggestionOnCommitCharacter: false,
        readOnly: readOnly,
        domReadOnly: readOnly,
        readOnlyMessage: {
          value: ''
        },
        scrollBeyondLastLine: false,
        codeLens: false,
        contextmenu: false,
        //accessibilityHelpUrl: false,
        accessibilitySupport: 'off',
        renderLineHighlight: readOnly ? 'none' : 'all',
        renderWhitespace: 'none',
        wordWrap: wordWrap ? 'on' : 'off',
        fontSize: 12
      }}
    />
  )
}
