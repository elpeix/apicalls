import React, { useContext, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import ScriptEditor from '../base/Editor/ScriptEditor'

const scriptOptions = [
  { value: 'pre', label: 'Pre Script' },
  { value: 'post', label: 'Post Script' }
]

export default function RequestScript({ wordWrap = false }: { wordWrap?: boolean }) {
  const { request } = useContext(RequestContext)
  const [scriptType, setScriptType] = useState<'pre' | 'post'>('pre')

  if (!request) return null

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScriptType(e.target.value as 'pre' | 'post')
  }

  return (
    <div className={styles.requestBody}>
      <label className={styles.requestBodyType}>
        <span>Type:</span>
        <SimpleSelect
          className={styles.contentType}
          options={scriptOptions}
          value={scriptType}
          onChange={handleSelectChange}
        />
      </label>
      <div className={styles.contentBody}>
        {scriptType === 'pre' ? (
          <ScriptEditor
            script={request.preScript}
            onChange={(val) => request.setPreScript(val)}
            wordWrap={wordWrap}
          />
        ) : (
          <ScriptEditor
            script={request.postScript}
            onChange={(val) => request.setPostScript(val)}
            wordWrap={wordWrap}
          />
        )}
      </div>
    </div>
  )
}
