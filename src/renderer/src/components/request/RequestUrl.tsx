import React, { useContext, useRef, useState } from 'react'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import Autocompleter from '../base/Autocompleter/Autocompleter'

export default function RequestUrl() {
  const { request, pasteCurl, getRequestEnvironment, tabId } = useContext(RequestContext)
  const urlRef = useRef<HTMLInputElement>(null)

  const [internalUrl, setInternalUrl] = useState<string | null>(null)

  const [lastTabId, setLastTabId] = useState(tabId)
  if (tabId !== lastTabId) {
    setLastTabId(tabId)
    setInternalUrl(null)
  }

  const [paramsAreValid, setParamsAreValid] = useState(true)

  if (!request) {
    return null
  }

  const displayUrl = internalUrl ?? request.getFullUrl()
  const [urlBase] = displayUrl.split('?')
  const urlError = displayUrl.length > 0 && !request.urlIsValid({ url: urlBase })

  const handleUrlChange = (value: string) => {
    setInternalUrl(value)

    try {
      request.setFullUrl(value)
      setParamsAreValid(true)
    } catch (_) {
      setParamsAreValid(false)
    }
  }

  const handleUrlBlur = () => {
    if (internalUrl !== null) {
      request.setFullUrl(internalUrl)
    }
    setInternalUrl(null)
  }

  const getClassName = () => {
    return `${styles.url} ${displayUrl.length && (urlError || !paramsAreValid) ? styles.error : ''}`
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
      key={tabId}
      inputRef={urlRef}
      className={getClassName()}
      value={displayUrl}
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
