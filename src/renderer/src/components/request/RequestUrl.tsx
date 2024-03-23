import React, { useEffect, useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'

export default function RequestUrl({ request }: { request: RequestContextRequest }) {
  const urlRef = useRef<HTMLInputElement>()
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(request.urlIsValid({}))

  useEffect(() => {
    const params = request.params
      .filter((param) => param.enabled)
      .map((param) => `${param.name}=${param.value}`)
      .join('&')
    setUrl(`${request.url}${params ? '?' + params : ''}`)
    setUrlError(!request.urlIsValid({}))
  }, [request])

  useEffect(() => {
    urlRef.current?.focus()
  }, [urlRef])

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
