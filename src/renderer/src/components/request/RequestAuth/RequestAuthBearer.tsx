import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './RequestAuth.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Autocompleter from '../../base/Autocompleter/Autocompleter'

export default function RequestAuthBearer() {
  const { request, getRequestEnvironment } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const [authValue, setAuthValue] = useState<RequestAuthValue>(null)

  const environmentId = getRequestEnvironment()?.id

  useEffect(() => {
    if (request) {
      setAuthValue(request.auth?.value)
    }
  }, [request])

  const handleInputValueChange = (value: string) => {
    setAuthValue(value)
    request?.setAuth({ type: 'bearer', value })
  }

  return (
    <Autocompleter
      inputRef={inputRef}
      placeholder="Your authorization token..."
      className={styles.authorizationInput}
      onChange={handleInputValueChange}
      value={typeof authValue === 'string' ? authValue : ''}
      offsetX={-9}
      offsetY={8}
      environmentId={environmentId}
    />
  )
}
