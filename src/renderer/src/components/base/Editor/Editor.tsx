import { Monaco, Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '../../../context/AppContext'
import { RequestContext } from '../../../context/RequestContext'
import { useEditorTheme } from './useEditorTheme'
import { createMethod } from '../../../lib/factory'

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
  const { appSettings, tabs } = useContext(AppContext)
  const { isActive, setEditorState, getEditorState, getRequestEnvironment } =
    useContext(RequestContext)

  const { theme, themeData } = useEditorTheme(appSettings)
  const editorRef = useRef<EditorRefType | null>(null)

  // Stable onChange handler to avoid re-rendering EditorWrapped when only the handler changes
  const onChangeRef = useRef(onChange)
  const linkOpenBehaviorRef = useRef<AppSettingsLinkOpenBehavior>('app')

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    linkOpenBehaviorRef.current = appSettings?.settings?.linkOpenBehavior ?? 'app'
  }, [appSettings?.settings?.linkOpenBehavior])

  const handleOnChange: OnChange = useCallback((value, ev) => {
    onChangeRef.current?.(value, ev)
  }, [])

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
      onChange={handleOnChange}
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

        monaco.editor.registerLinkOpener({
          open: (link) => {
            const linkOpenBehavior = linkOpenBehaviorRef.current
            const environment = getRequestEnvironment()
            const scheme = link.scheme ?? ''
            const authority = link.authority ?? ''
            const hasBaseUrl = Boolean(scheme && authority)
            const variable = environment?.variables?.find((env) => env.name === 'baseUrl')
            const variableEnabled = variable?.enabled !== false
            let baseUrl = hasBaseUrl ? `${scheme}://${authority}` : ''
            if (variable && variableEnabled) {
              if (linkOpenBehavior === 'browser') {
                if (variable.value) {
                  baseUrl = variable.value
                }
              } else {
                baseUrl = '{{baseUrl}}'
              }
            }
            const rawPath = link.path ?? ''
            const normalizedPath = rawPath && !rawPath.startsWith('/') ? `/${rawPath}` : rawPath
            const queryParams: KeyValue[] = []
            if (link.query) {
              const searchParams = new URLSearchParams(link.query)
              for (const [name, value] of searchParams.entries()) {
                queryParams.push({ name, value, enabled: true } as KeyValue)
              }
            }
            const url = `${baseUrl}${normalizedPath}`

            if (linkOpenBehavior === 'browser') {
              if (!url) {
                return false
              }
              window.open(url, '_blank', 'noopener,noreferrer')
              return true
            }

            if (!tabs) {
              return false
            }
            const request: RequestType = {
              id: window.crypto.randomUUID(),
              type: 'draft',
              name: normalizedPath || rawPath || url,
              request: {
                method: createMethod('GET'),
                url,
                queryParams
              }
            }
            tabs.openTab({ request })
            return true
          }
        })
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
