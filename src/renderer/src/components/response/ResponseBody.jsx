import React, { useEffect, useMemo, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { formatSource, getLanguageName } from '../../lib/languageSupport'

export default function ResponseBody({ value }) {

  const [showRaw, setShowRaw] = useState(false)
  const [rawValue, setRawValue] = useState('')
  const [parsedValue, setParsedValue] = useState('')

  useEffect(() => {
    setRawValue(value)
    setParsedValue(formatSource(value))
  }, [value])

  const language = useMemo(() => {
    if (showRaw) return 'text'
    return getLanguageName(rawValue)
  }, [showRaw, rawValue])

  const handleCopy = () => {
    navigator.clipboard.writeText(showRaw ? rawValue : parsedValue)
  }

  const options = {
    minimap: {
      enabled: false
    },
    commandPalette: false,
    acceptSuggestionOnCommitCharacter: false,
    readOnly: true,
    readOnlyMessage: '',
    scrollBeyondLastLine: false,
    codeLens: false,
    contextmenu: false,
    accessibilityHelpUrl: true,
    accessibilitySupport: 'off',

    // Disable column selection
    //columnSelection: false,

    // Disable line colors
    renderLineHighlight: 'none',

    // Disable indendt lines
    renderIndentGuides: false,
    
    // Hide invisible characters
    renderWhitespace: 'none',

    wordWrap: showRaw ? 'on' : 'off',
    fontSize: 12,
  }

  return (
    <div className="response-body">
      { rawValue && (
        <>
          <div className="response-body-header">
            <div className='copy' onClick={handleCopy}>Copy</div>
            <div className={`response-body-header-switch-raw ${showRaw ? 'active' : ''}`} onClick={() => setShowRaw(!showRaw)}>Raw</div>
          </div>

          <div className="response-body-content">
            <Editor
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              height="100%"
              width="100%"
              value={showRaw ? rawValue : parsedValue}
              options={options}
            />
          </div>
        </>
      )}
      { !rawValue && (
        <div>No content</div>
      )}
    </div>
  )
}

