import React, { useContext, useEffect, useRef, useState } from 'react'
import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
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
  const getThemeName = (name: string | undefined, mode: string | undefined) => {
    if (!name) {
      return matchMedia.matches ? 'vs-dark' : 'vs'
    }
    if (mode === 'hc-light' || mode === 'hc-black') {
      return mode
    }
    return name
  }

  const { appSettings } = useContext(AppContext)
  const requestContext = useContext(RequestContext)
  const [theme, setTheme] = useState(
    getThemeName(appSettings?.getEditorTheme()?.name, appSettings?.getEditorTheme()?.mode)
  )
  const [themeData, setThemeData] = useState<monaco.editor.IStandaloneThemeData | null>(
    appSettings?.getEditorTheme()?.data || null
  )
  const editorRef = useRef<Monaco | null>(null)

  useEffect(() => {
    const editorTheme = appSettings?.getEditorTheme()
    if (!editorTheme) {
      return
    }
    const editorThemeMode = editorTheme.mode
    if (editorThemeMode === 'hc-light' || editorThemeMode === 'hc-black') {
      setThemeData(null)
      setTheme(editorThemeMode)
      return
    }
    setThemeData(editorTheme.data)
    if (editorTheme.data && editorTheme.data.colors) {
      const monacoEditor = editorRef.current || monaco
      monacoEditor.editor.defineTheme(editorTheme.name, editorTheme.data)
      monacoEditor.editor.setTheme(editorTheme.name)
      setTheme(editorTheme.name)
    } else {
      setTheme(editorTheme.mode === 'dark' ? 'vs-dark' : 'vs')
    }
  }, [appSettings])

  return requestContext.isActive ? (
    <RenderEditor
      language={language}
      value={value}
      editorRef={editorRef}
      readOnly={readOnly}
      wordWrap={wordWrap || false}
      theme={theme}
      themeData={themeData}
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
  theme,
  themeData
}: {
  language: string
  value: string
  editorRef: React.MutableRefObject<Monaco | null>
  readOnly: boolean
  wordWrap: boolean
  onChange?: OnChange
  theme: string
  themeData: monaco.editor.IStandaloneThemeData | null
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
        if (themeData && themeData.colors) {
          monaco.editor.defineTheme(theme, themeData)
        }
        monaco.editor.setTheme(theme)
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
