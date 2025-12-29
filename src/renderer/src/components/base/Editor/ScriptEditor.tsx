import React, { useEffect, useState } from 'react'
import Editor from './Editor'
import styles from './Editor.module.css'

type RequestScriptProps = {
  script: string
  wordWrap?: boolean
  onChange: (script: string) => void
}

export default function ScriptEditor({ script, wordWrap, onChange }: RequestScriptProps) {
  const [localScript, setLocalScript] = useState(script || '')

  useEffect(() => {
    setLocalScript(script || '')
  }, [script])

  const handleScriptChange = (value: string | undefined) => {
    const newScript = value || ''
    setLocalScript(newScript)
    onChange(newScript)
  }

  return (
    <div className={styles.scriptEditor}>
      <Editor
        value={localScript}
        language="javascript"
        onChange={handleScriptChange}
        type="none"
        readOnly={false}
        wordWrap={wordWrap}
      />
    </div>
  )
}
