import React, { useEffect, useState } from 'react'
import ScriptEditor from '../../../../base/Editor/ScriptEditor'
import styles from './CollectionScriptEditor.module.css'

export default function CollectionScriptEditor({
  script,
  onSave
}: {
  script: string
  onSave: (script: string) => void
}) {
  const [localScript, setLocalScript] = useState(script || '')

  useEffect(() => {
    onSave(localScript)
  }, [localScript, onSave])

  return (
    <div className={styles.editor}>
      <div className={styles.content}>
        <ScriptEditor script={localScript} onChange={setLocalScript} />
      </div>
    </div>
  )
}
