import React, { useCallback, useMemo, useRef, useState } from 'react'
import styles from './Request.module.css'
import { useRequestActions, useRequestMeta } from '../../context/RequestContext'
import Autocompleter from '../base/Autocompleter/Autocompleter'

export default function RequestUrl() {
  const { setFullUrl, getFullUrl, urlIsValid } = useRequestActions()
  const { pasteCurl, getRequestEnvironment, tabId } = useRequestMeta()
  const urlRef = useRef<HTMLInputElement>(null)

  // State is keyed by tabId - reset when tab changes
  const [state, setState] = useState<{
    tabId: Identifier | undefined
    internalUrl: string | null
    paramsAreValid: boolean
  }>({ tabId, internalUrl: null, paramsAreValid: true })

  // Reset state when tab changes (React-approved derived state pattern)
  if (tabId !== state.tabId) {
    setState({ tabId, internalUrl: null, paramsAreValid: true })
  }

  const { internalUrl, paramsAreValid } = state

  const displayUrl = internalUrl ?? (getFullUrl() || '')

  const handleUrlChange = useCallback(
    (value: string) => {
      let valid = true
      try {
        setFullUrl(value)
      } catch (_) {
        valid = false
      }
      setState((prev) => ({ ...prev, internalUrl: value, paramsAreValid: valid }))
    },
    [setFullUrl]
  )

  const handleUrlBlur = useCallback(() => {
    setState((prev) => {
      if (prev.internalUrl !== null) {
        setFullUrl(prev.internalUrl)
      }
      return { ...prev, internalUrl: null }
    })
  }, [setFullUrl])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const value = e.clipboardData.getData('text/plain')
      if (value.startsWith('curl ')) {
        e.preventDefault()
        pasteCurl(value)
      }
    },
    [pasteCurl]
  )

  const urlError = useMemo(() => {
    if (!displayUrl.length) return false
    const [urlBase] = displayUrl.split('?')
    return !urlIsValid({ url: urlBase })
  }, [displayUrl, urlIsValid])

  const className = useMemo(
    () => `${styles.url} ${displayUrl.length && (urlError || !paramsAreValid) ? styles.error : ''}`,
    [displayUrl.length, urlError, paramsAreValid]
  )

  const environmentId = useMemo(() => getRequestEnvironment()?.id, [getRequestEnvironment])

  return (
    <Autocompleter
      key={tabId}
      inputRef={urlRef}
      className={className}
      value={displayUrl}
      onChange={handleUrlChange}
      onBlur={handleUrlBlur}
      onPaste={handlePaste}
      placeholder="Enter URL..."
      offsetX={-11}
      offsetY={11}
      environmentId={environmentId}
    />
  )
}
