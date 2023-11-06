import React, { useEffect, useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'

export default function RequestUrl({ request }) {

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

  const handleUrlChange = value => {
    const [url] = value.split('?')
    setUrlError(url.length && !request.urlIsValid({ url }))
  }

  const handleUrlBlur = value => {
    const [url, params] = value.split('?')
    setUrl(value)
    request.setUrl(url)

    const paramList = params ? params.split('&')
      .map(param => param.trim())
      .filter(param => param.length > 0)
      .map(param => {
        const entry = param.split('=')
        if (entry.length <= 2) {
          return { name: entry[0], value: entry[1] ? entry[1] : '', enabled: true }
        }
      }) : []

    const newParams = request.params.map(param => {
      const paramIndex = paramList.findIndex(p => p.name === param.name)
      if (paramIndex > -1) {
        const value = paramList[paramIndex].value
        paramList.splice(paramIndex, 1)
        return { ...param, value }
      } else {
        if (!param.enabled) return param
        return { ...param, toDelete: true }
      }
    }).filter(param => !param.toDelete)

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
