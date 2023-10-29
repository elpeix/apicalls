import React, { useEffect, useMemo, useState } from 'react'
import { formatSource, getLanguageName } from '../../lib/languageSupport'
import Editor from '../base/Editor'

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
              language={language}
              value={showRaw ? rawValue : parsedValue}
              wordWrap={showRaw}
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

