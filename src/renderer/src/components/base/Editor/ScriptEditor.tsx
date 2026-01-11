import React from 'react'
import Editor from './Editor'
import styles from './Editor.module.css'

type RequestScriptProps = {
  script: string
  wordWrap?: boolean
  onChange: (script: string) => void
}

export default function ScriptEditor({ script, wordWrap, onChange }: RequestScriptProps) {
  const handleScriptChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className={styles.scriptEditor}>
      <Editor
        value={script || ''}
        language="javascript"
        onChange={handleScriptChange}
        type="none"
        readOnly={false}
        wordWrap={wordWrap}
      />
    </div>
  )
}
