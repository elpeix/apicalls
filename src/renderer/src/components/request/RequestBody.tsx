import React, { useContext, useState } from 'react'
import Editor from '../base/Editor/Editor'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import { getBody } from '../../lib/utils'
import FormDataEditor from './FormDataEditor'

export default function RequestBody({ wordWrap = false }: { wordWrap?: boolean }) {
  const { request } = useContext(RequestContext)

  const [contentType, setContentType] = useState<ContentTypes>(() => {
    if (!request) return 'none'
    return request.body === 'none' || request.body === ''
      ? 'none'
      : typeof request.body !== 'string'
        ? request.body.contentType
        : 'json'
  })
  const [value, setValue] = useState(getBody(request?.body || ''))

  if (!request) return null

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ContentTypes
    setContentType(selected)
    if (selected === 'none') {
      setValue('')
      request.setBody('none')
    } else {
      request.setBody({
        contentType: selected,
        value
      })
    }
  }

  const handleBodyChange = (value: string | undefined) => {
    value = value || ''
    setValue(value)
    if (contentType !== 'none') {
      request.setBody({
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
