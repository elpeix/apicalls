import React, { useEffect, useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'

export default function RequestUrl({ request }: {
  request: RequestContextRequest
}) {

  const urlRef = useRef()

  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(request.urlIsValid({}))

  useEffect(() => {
    const params = request.params
      .filter(param => param.enabled && param.value.length > 0)
      .map(param => `${param.name}=${param.value}`)
      .join('&')
    setUrl(`${request.url}${params ? '?' + params : ''}`)
    setUrlError(!request.urlIsValid({}))
  }, [request])

  const handleUrlChange = (value: string) => {
    const [url] = value.split('?')
    setUrlError(url.length > 0 && !request.urlIsValid({ url }))
  }

  const handleUrlBlur = (value: string) => {
    const [url, params] = value.split('?')
    setUrl(value)
    request.setUrl(url)

    const paramList: KeyValue[] = params ? params.split('&')
      .map((param): KeyValue | undefined => {
        const entry = param.split('=')
        if (entry.length <= 2) {
          const name = entry[0].trim()
          const value = entry[1].trim()
          return { name, value, enabled: true }
        }
      })
      .filter((param): param is KeyValue => param !== undefined) : []

    const newParams = request.params.map(param => {
      const paramIndex = paramList.findIndex(p => p.name === param.name)
      if (paramIndex > -1) {
        const value = paramList[paramIndex].value
        paramList.splice(paramIndex, 1)
        return { ...param, value }
      } else {
        if (!param.enabled) return param
        return { ...param, toBeRemoved: true }
      }
    }).filter(param => !param.toBeRemoved)

    request.setParams([...newParams, ...paramList])
  }

  const getClassName = () => {
    return `${styles.url} ${url.length && urlError ? styles.error : ''}`
  }

  return (
    <Input 
      inputRef={urlRef}
      className={getClassName()}
      value={url}
      onChange={handleUrlChange}
      onBlur={handleUrlBlur}
      placeholder='Enter URL...'
    />
  )
}
