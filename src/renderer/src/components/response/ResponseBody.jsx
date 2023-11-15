import React, { useEffect, useMemo, useState } from 'react'
import { formatSource, getLanguageName } from '../../lib/languageSupport'
import Editor from '../base/Editor'
import styles from './Response.module.css'

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
    <div className={`${rawValue.length ? styles.body : styles.bodyNoContent}`}>
      { rawValue && (
        <>
          <div className={styles.bodyHeader}>
            <div className={styles.copy} onClick={handleCopy}>Copy</div>
            <div className={`${styles.raw} ${showRaw ? styles.active : ''}`} onClick={() => setShowRaw(!showRaw)}>Raw</div>
          </div>

          <div className={styles.bodyContent}>
            <Editor
              language={language}
              value={showRaw ? rawValue : parsedValue}
              wordWrap={showRaw}
            />
          </div>
        </>
      )}
      { !rawValue && (
        <div className={styles.noContent}>No content</div>
      )}
    </div>
  )
}

