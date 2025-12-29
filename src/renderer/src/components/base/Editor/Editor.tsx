import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import { RequestContext } from '../../../context/RequestContext'

const base = window || global
const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

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
  const { isActive, setEditorState, getEditorState } = useContext(RequestContext)
  const [mustRender, setMustRender] = useState(false)
  const [viewState, setViewState] = useState<monaco.editor.ICodeEditorViewState | null>(null)
  const [theme, setTheme] = useState(
    getThemeName(appSettings?.getEditorTheme()?.name, appSettings?.getEditorTheme()?.mode)
  )
  const [themeData, setThemeData] = useState<monaco.editor.IStandaloneThemeData | null>(
    appSettings?.getEditorTheme()?.data || null
  )
  const editorRef = useRef<EditorRefType | null>(null)

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
      if (theme === editorTheme.name) {
        return
      }
      const editorRefData = editorRef.current
      const monacoEditor = editorRefData?.monaco || monaco
      monacoEditor.editor.defineTheme(editorTheme.name, editorTheme.data)
      monacoEditor.editor.setTheme(editorTheme.name)
      setTheme(editorTheme.name)
    } else {
      setTheme(editorTheme.mode === 'vs-dark' ? 'vs-dark' : 'vs')
    }
  }, [appSettings])

  useEffect(() => {
    if (type === 'none') {
      return
    }
    const rawViewState = getEditorState(type)
    if (rawViewState) {
      setViewState(JSON.parse(rawViewState))
    }
    return () => {
      if (editorRef.current && editorRef.current.editor) {
        const viewState = editorRef.current.editor.saveViewState()
        if (viewState) {
          setEditorState(type, JSON.stringify(viewState))
        }
      }
    }
  }, [isActive])

  useEffect(() => {
    setMustRender(type === 'none' || value.length < 1024 * 1024 || isActive)
  }, [value, isActive])

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
      language={language}
      onChange={onChange}
      value={value}
      theme={theme}
      options={options}
      onMount={(editor, monaco) => {
        editorRef.current = { editor, monaco }
        if (viewState) {
          editor.restoreViewState(viewState)
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
        value={value}
        options={options}
        onMount={onMount}
      />
    )
  },
  (prepProps, nextPops) => {
    return (
      prepProps.value !== nextPops.value &&
      prepProps.theme !== nextPops.theme &&
      prepProps.language !== nextPops.language
    )
  }
)
EditorWrapped.displayName = 'EditorWrapped'
