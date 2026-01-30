import React, { memo } from 'react'
import Editor from '../base/Editor/Editor'
import ExternalContent from './ExternalContent'
import styles from './Response.module.css'

type ResponseBodyProps = {
  value: string
  raw: boolean
  wordWrap?: boolean
  language: string
  baseUrl?: string
  allowScripts?: boolean
}

const ResponseBody = memo(function ResponseBody({
  value,
  raw,
  wordWrap,
  language,
  baseUrl = '',
  allowScripts = false
}: ResponseBodyProps) {
  const wordWrapEditor = wordWrap === undefined ? raw : wordWrap

  return (
    <div className={`${value.length ? styles.body : styles.bodyNoContent}`}>
      {value && (
        <div className={styles.bodyContent}>
          {language === 'html' && (
            <ExternalContent content={value} baseUrl={baseUrl} allowScripts={allowScripts} />
          )}
          {language !== 'html' && (
            <Editor language={language} value={value} wordWrap={wordWrapEditor} type="response" />
          )}
        </div>
      )}
      {!value && <div className={styles.noContent}>No content</div>}
    </div>
  )
})

export default ResponseBody
