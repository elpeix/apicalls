import React, { useContext, useState } from 'react'
import Editor from '../base/Editor'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import { getBody } from '../../lib/utils'

export default function RequestBody() {
  const { request } = useContext(RequestContext)

  if (!request) return null

  const [contentType, setContentType] = useState<ContentTypes>(
    request.body && typeof request.body !== 'string' ? request.body.contentType : 'json'
  )
  const [value, setValue] = useState(getBody(request.body))

  const contentTypes: Record<ContentTypes, string> = {
    json: 'Json',
    xml: 'Xml',
    text: 'Text'
  }

  const contentTypeOptions = Object.keys(contentTypes).map((contentType) => ({
    value: contentType,
    label: contentTypes[contentType as ContentTypes]
  }))

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contentType = e.target.value as ContentTypes
    setContentType(contentType)
    request.setBody({
      contentType,
      value
    })
  }

  const handleBodyChange = (value: string | undefined) => {
    value = value || ''
    setValue(value)
    request.setBody({
      contentType,
      value: value as string
    })
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
      <Editor
        language={contentType}
        onChange={handleBodyChange}
        value={value}
        readOnly={false}
        type="request"
      />
    </div>
  )
}
