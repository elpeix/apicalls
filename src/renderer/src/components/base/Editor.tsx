import React, { useContext, useEffect, useRef, useState } from 'react'
import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import { AppContext } from '../../context/AppContext'

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
  const [theme, setTheme] = useState('vs-light')
  const editorRef = useRef<Monaco | null>(null)

  useEffect(() => {
    console.log('settings', appSettings, editorRef)
    const editorTheme = appSettings?.getEditorTheme()
    if (!editorTheme) {
      return
    }
    setTheme(editorTheme)
    if (editorRef.current) {
      editorRef.current.editor.setTheme(editorTheme)
    }
  }, [appSettings])

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

        // Disable column selection
        //columnSelection: false,

        // Disable line colors
        // renderLineHighlight: 'none',

        // Disable indendt lines
        //renderIndentGuides: false,

        // Hide invisible characters
        renderWhitespace: 'none',

        wordWrap: wordWrap ? 'on' : 'off',
        fontSize: 12
      }}
    />
  )
}
