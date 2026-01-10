import React, { useContext, useRef } from 'react'
import styles from './RequestAuth.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Autocompleter from '../../base/Autocompleter/Autocompleter'

export default function RequestAuthBearer() {
  const { request, getRequestEnvironment } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const environmentId = getRequestEnvironment()?.id

  const handleInputValueChange = (value: string) => {
    request?.setAuth({ type: 'bearer', value })
  }

  const authValue = request?.auth?.value

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
