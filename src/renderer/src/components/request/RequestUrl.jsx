import React, { useContext, useEffect, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'

export default function RequestUrl() {

  const context = useContext(RequestContext)

  const [url, setUrl] = useState('')

  useEffect(() => {
    const params = context.request.params
      .filter(param => param.enabled)
      .map(param => `${param.name}=${param.value}`)
      .join('&')
    const url = `${context.request.url}${params ? '?' + params : ''}`
    setUrl(url)
  }, [context])

  const handleUrlChange = e => setUrl(e.target.value)

  const handleUrlBlur = e => {

    const [url, params] = e.target.value.split('?')
    context.request.setUrl(url)

    const paramList = params ? params.split('&')
      .map(param => param.trim())
      .filter(param => param.length > 0)
      .map(param => {
        const entry = param.split('=')
        if (entry.length <= 2) {
          return { name: entry[0], value: entry[1] ? entry[1] : '', enabled: true }
        }
      }) : []

    const newParams = context.request.params.map(param => {
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

    context.request.setParams([...newParams, ...paramList])
  }

  return (
    <input 
      type='text'
      className='request-url'
      value={url}
      onChange={handleUrlChange}
      onBlur={handleUrlBlur}
      placeholder='Enter URL...'
    />
  )
}
