import React from 'react'
import Editor from '../base/Editor'
import ExternalContent from './ExternalContent'
import styles from './Response.module.css'

export default function ResponseBody({
  value,
  raw,
  language
}: {
  value: string
  raw: boolean
  language: string
}) {
  return (
    <div className={`${value.length ? styles.body : styles.bodyNoContent}`}>
      {value && (
        <div className={styles.bodyContent}>
          {language === 'html' && <ExternalContent content={value} />}
          {language !== 'html' && <Editor language={language} value={value} wordWrap={raw} />}
        </div>
      )}
      {!value && <div className={styles.noContent}>No content</div>}
    </div>
  )
}
