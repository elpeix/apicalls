import React, { useState } from 'react'
import Editor from '../base/Editor/Editor'
import styles from './Request.module.css'
import { useRequestData, useRequestActions } from '../../context/RequestContext'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import { getBody } from '../../lib/utils'
import FormDataEditor from './FormDataEditor'

const contentTypes: Record<ContentTypes, string> = {
  none: 'None',
  json: 'Json',
  xml: 'Xml',
  'form-data': 'Multipart Form',
  'form-urlencoded': 'Form URL Encoded',
  text: 'Text'
}

const contentTypeOptions = Object.keys(contentTypes).map((contentType) => ({
  value: contentType,
  label: contentTypes[contentType as ContentTypes]
}))

export default function RequestBody({ wordWrap = false }: { wordWrap?: boolean }) {
  const { body } = useRequestData()
  const { setBody } = useRequestActions()

  const [contentType, setContentType] = useState<ContentTypes>(() => {
    return body === 'none' || body === ''
      ? 'none'
      : typeof body !== 'string'
        ? body.contentType
        : 'json'
  })
  const [value, setValue] = useState(getBody(body || ''))

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ContentTypes
    setContentType(selected)
    if (selected === 'none') {
      setValue('')
      setBody('none')
    } else {
      setBody({
        contentType: selected,
        value
      })
    }
  }

  const handleBodyChange = (value: string | undefined) => {
    value = value || ''
    setValue(value)
    if (contentType !== 'none') {
      setBody({
        contentType: contentType as Exclude<ContentTypes, 'none'>,
        value: value as string
      })
    }
  }

  return (
    <div className={styles.requestBody}>
      <label className={styles.requestBodyType}>
        <span>Type:</span>
        <SimpleSelect
          className={styles.contentType}
          options={contentTypeOptions}
          value={contentType}
          onChange={handleSelectChange}
        />
      </label>
      {contentType === 'form-data' ? (
        <FormDataEditor value={value} onChange={handleBodyChange} allowFiles={true} />
      ) : contentType === 'form-urlencoded' ? (
        <FormDataEditor value={value} onChange={handleBodyChange} allowFiles={false} />
      ) : (
        contentType !== 'none' && (
          <div className={styles.contentBody}>
            <Editor
              language={contentType}
              onChange={handleBodyChange}
              value={value}
              readOnly={false}
              type="request"
              wordWrap={wordWrap}
            />
          </div>
        )
      )}
    </div>
  )
}
