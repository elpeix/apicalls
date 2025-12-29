import React from 'react'
import Editor from '../base/Editor/Editor'
import ExternalContent from './ExternalContent'
import styles from './Response.module.css'

export default function ResponseBody({
  value,
  raw,
  wordWrap,
  language,
  allowScripts = false
}: {
  value: string
  raw: boolean
  wordWrap?: boolean
  language: string
  allowScripts?: boolean
}) {
  const wordWrapEditor = wordWrap === undefined ? raw : wordWrap

  return (
    <div className={`${value.length ? styles.body : styles.bodyNoContent}`}>
      {value && (
        <div className={styles.bodyContent}>
          {language === 'html' && <ExternalContent content={value} allowScripts={allowScripts} />}
          {language !== 'html' && (
            <Editor language={language} value={value} wordWrap={wordWrapEditor} type="response" />
          )}
        </div>
      )}
      {!value && <div className={styles.noContent}>No content</div>}
    </div>
  )
}
