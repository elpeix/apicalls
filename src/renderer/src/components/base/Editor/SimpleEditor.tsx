import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '../../../context/AppContext'
import { useEditorTheme } from './useEditorTheme'

export default function SimpleEditor({
  language = 'plaintext',
  value,
  readOnly = false,
  wordWrap = true,
  onChange
}: {
  language?: string
  value: string
  readOnly?: boolean
  wordWrap?: boolean
  onChange?: OnChange
}) {
  const { appSettings } = useContext(AppContext)
  const { theme, themeData } = useEditorTheme(appSettings)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    const monacoInstance = monaco
    if (themeData && themeData.colors) {
      monacoInstance.editor.defineTheme(theme, themeData)
    }
    monacoInstance.editor.setTheme(theme)
  }, [theme, themeData])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' })
    }
  }, [wordWrap])

  const options = useMemo(() => {
    return {
      minimap: { enabled: false },
      readOnly,
      domReadOnly: readOnly,
      readOnlyMessage: { value: '' },
      scrollBeyondLastLine: false,
      codeLens: false,
      contextmenu: false,
      accessibilitySupport: 'off',
      renderLineHighlight: readOnly ? 'none' : 'all',
      renderWhitespace: 'none',
      wordWrap: wordWrap ? 'on' : 'off',
      fontSize: 12,
      folding: false
    } as monaco.editor.IStandaloneEditorConstructionOptions
  }, [readOnly, wordWrap])

  const handleBeforeMount = useCallback(
    (monacoInstance: Monaco) => {
      if (themeData && themeData.colors) {
        monacoInstance.editor.defineTheme(theme, themeData)
      }
    },
    [theme, themeData]
  )

  const handleMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
      editorRef.current = editor
      if (themeData && themeData.colors) {
        monacoInstance.editor.defineTheme(theme, themeData)
      }
      monacoInstance.editor.setTheme(theme)
    },
    [theme, themeData]
  )

  return (
    <MonacoEditor
      defaultLanguage={language}
      language={language}
      onChange={onChange}
      theme={theme}
      height="100%"
      width="100%"
      loading={null}
      value={value}
      options={options}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
    />
  )
}
