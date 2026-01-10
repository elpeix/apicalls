import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '../../../context/AppContext'
import { RequestContext } from '../../../context/RequestContext'
import { useEditorTheme } from './useEditorTheme'

type EditorRefType = {
  editor: monaco.editor.IStandaloneCodeEditor
  monaco: Monaco
}

export default function Editor({
  language = 'json',
  value,
  readOnly = true,
  wordWrap,
  onChange,
  type
}: {
  language: string
  value: string
  type: 'request' | 'response' | 'none'
  readOnly?: boolean
  wordWrap?: boolean
  onChange?: OnChange
}) {
  const { appSettings } = useContext(AppContext)
  const { isActive, setEditorState, getEditorState } = useContext(RequestContext)

  const { theme, themeData } = useEditorTheme(appSettings)
  const editorRef = useRef<EditorRefType | null>(null)

  // Derived state to determine if we should render (optimization for large files in background)
  const mustRender = type === 'none' || value.length < 1024 * 1024 || isActive

  // Load initial view state when type changes
  const initialViewState = useMemo(() => {
    if (type === 'none') {
      return null
    }
    const rawViewState = getEditorState(type)
    return rawViewState ? JSON.parse(rawViewState) : null
  }, [type, getEditorState])

  useEffect(() => {
    const editorInstance = editorRef.current
    const monacoInstance = editorInstance?.monaco || monaco

    if (themeData && themeData.colors) {
      monacoInstance.editor.defineTheme(theme, themeData)
    }
    monacoInstance.editor.setTheme(theme)
  }, [theme, themeData])

  useEffect(() => {
    return () => {
      if (type !== 'none' && editorRef.current && editorRef.current.editor) {
        const viewState = editorRef.current.editor.saveViewState()
        if (viewState) {
          setEditorState(type, JSON.stringify(viewState))
        }
      }
    }
  }, [isActive, type, setEditorState])

  const options = useMemo(() => {
    return {
      minimap: {
        enabled: false
      },
      acceptSuggestionOnCommitCharacter: false,
      readOnly: readOnly,
      domReadOnly: readOnly,
      readOnlyMessage: {
        value: ''
      },
      scrollBeyondLastLine: false,
      codeLens: false,
      contextmenu: false,
      accessibilitySupport: 'off',
      renderLineHighlight: readOnly ? 'none' : 'all',
      renderWhitespace: 'none',
      wordWrap: wordWrap ? 'on' : 'off',
      fontSize: 12
    } as monaco.editor.IStandaloneEditorConstructionOptions
  }, [readOnly, wordWrap])

  if (!mustRender) {
    return <></>
  }
  return (
    <EditorWrapped
      key={type}
      language={language}
      onChange={onChange}
      value={value}
      theme={theme}
      options={options}
      onMount={(editor, monaco) => {
        editorRef.current = { editor, monaco }
        if (initialViewState) {
          editor.restoreViewState(initialViewState)
        }
        if (themeData && themeData.colors) {
          monaco.editor.defineTheme(theme, themeData)
        }
        monaco.editor.setTheme(theme)
      }}
    />
  )
}

const EditorWrapped = memo(
  ({
    language,
    value,
    onChange,
    theme,
    options,
    onMount
  }: {
    language: string
    value: string
    onChange?: OnChange
    theme: string
    options: monaco.editor.IStandaloneEditorConstructionOptions
    onMount: (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void
  }) => {
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
        onMount={onMount}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.theme === nextProps.theme &&
      prevProps.language === nextProps.language
    )
  }
)
EditorWrapped.displayName = 'EditorWrapped'
