import React, { useContext, useEffect, useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'

export default function RequestUrl() {
  const { request } = useContext(RequestContext)

  if (!request) {
    return null
  }

  const urlRef = useRef<HTMLInputElement>()
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(request.urlIsValid({}))

  useEffect(() => {
    const queryParams = request.queryParams.items
      .filter((param: KeyValue) => param.enabled)
      .map((param: KeyValue) => `${param.name}=${param.value}`)
      .join('&')
    setUrl(`${request.url}${queryParams ? '?' + queryParams : ''}`)
    setUrlError(!request.urlIsValid({}))
  }, [request])

  useEffect(() => {
    if (request.url) {
      return
    }
    urlRef.current?.focus()
  }, [urlRef, request.url])

  const handleUrlChange = (value: string) => {
    const [url] = value.split('?')
    setUrlError(url.length > 0 && !request.urlIsValid({ url }))
    request.setFullUrl(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      const target = event.target as HTMLInputElement
      request.setFullUrl(target.value)
    }
  }

  const handleUrlBlur = (value: string) => {
    request.setFullUrl(value)
  }

  const getClassName = () => `${styles.url} ${url.length && urlError ? styles.error : ''}`

  return (
    <Input
      inputRef={urlRef}
      className={getClassName()}
      value={url}
      onChange={handleUrlChange}
      onBlur={handleUrlBlur}
      onKeyDown={handleKeyDown}
      placeholder="Enter URL..."
      showTip={true}
    />
  )
}
