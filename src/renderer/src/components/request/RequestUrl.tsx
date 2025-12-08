import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import Autocompleter from '../base/Autocompleter/Autocompleter'

export default function RequestUrl() {
  const { request, pasteCurl, getRequestEnvironment } = useContext(RequestContext)
  const urlRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(request?.urlIsValid({}))
  const [paramsAreValid, setParamsAreValid] = useState(true)

  useEffect(() => {
    setUrl(request?.getFullUrl() || '')
    setUrlError(!request?.urlIsValid({}))
  }, [request])

  useEffect(() => {
    if (!request?.url) {
      urlRef.current?.focus()
    }
  }, [urlRef, request?.url])

  if (!request) {
    return null
  }

  const handleUrlChange = (value: string) => {
    const [url] = value.split('?')
    setUrlError(url.length > 0 && !request.urlIsValid({ url }))
    try {
      request.setFullUrl(value)
      setParamsAreValid(true)
    } catch (_) {
      setParamsAreValid(false)
    }
  }

  const handleUrlBlur = (value: string) => {
    request.setFullUrl(value)
  }

  const getClassName = () => {
    return `${styles.url} ${url.length && (urlError || !paramsAreValid) ? styles.error : ''}`
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData('text/plain')
    if (value.startsWith('curl ')) {
      e.preventDefault()
      pasteCurl(value)
    }
  }

  return (
    <Autocompleter
      inputRef={urlRef}
      className={getClassName()}
      value={url}
      onChange={handleUrlChange}
      onBlur={handleUrlBlur}
      onPaste={handlePaste}
      placeholder="Enter URL..."
      offsetX={-11}
      offsetY={11}
      environmentId={getRequestEnvironment()?.id}
    />
  )
}
