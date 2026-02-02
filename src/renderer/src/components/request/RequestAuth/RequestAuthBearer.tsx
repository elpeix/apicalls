import React, { useRef } from 'react'
import styles from './RequestAuth.module.css'
import { useRequestData, useRequestActions, useRequestMeta } from '../../../context/RequestContext'
import Autocompleter from '../../base/Autocompleter/Autocompleter'

export default function RequestAuthBearer() {
  const { auth } = useRequestData()
  const { setAuth } = useRequestActions()
  const { getRequestEnvironment } = useRequestMeta()

  const inputRef = useRef<HTMLInputElement>(null)

  const environmentId = getRequestEnvironment()?.id

  const handleInputValueChange = (value: string) => {
    setAuth({ type: 'bearer', value })
  }

  const authValue = auth?.value

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
