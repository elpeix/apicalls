import React from 'react'
import { Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import useTheme from '../../hooks/useTheme'

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
  const { getTheme } = useTheme()

  return (
    <MonacoEditor
      defaultLanguage={language}
      language={language}
      onChange={onChange}
      theme={getTheme('vs-light', 'vs-dark')}
      height="100%"
      width="100%"
      value={value}
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
