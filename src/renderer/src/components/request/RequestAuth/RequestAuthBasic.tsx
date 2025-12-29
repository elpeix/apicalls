import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './RequestAuth.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Autocompleter from '../../base/Autocompleter/Autocompleter'

export default function RequestAuthBasic() {
  const { request, getRequestEnvironment } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const [authValue, setAuthValue] = useState<RequestAuthValue>(null)

  const environmentId = getRequestEnvironment()?.id

  useEffect(() => {
    if (request) {
      setAuthValue(request.auth?.value)
    }
  }, [request])

  const handleInputValueChangeUsername = (value: string) => {
    const authValueBasic = authValue as RequestAuthBasic
    setAuthValue({ ...authValueBasic, username: value })
    request?.setAuth({ type: 'basic', value: { ...authValueBasic, username: value } })
  }

  const handleInputValueChangePassword = (value: string) => {
    const authValueBasic = authValue as RequestAuthBasic
    request?.setAuth({ type: 'basic', value: { ...authValueBasic, password: value } })
  }
  return (
    <div className={styles.basicAuth}>
      <label>
        <span className={styles.label}>Username</span>
        <Autocompleter
          inputRef={inputRef}
          placeholder="Your username..."
          className={styles.authorizationInput}
          onChange={handleInputValueChangeUsername}
          value={(authValue as RequestAuthBasic)?.username || ''}
          offsetX={-9}
          offsetY={8}
          environmentId={environmentId}
        />
      </label>
      <label>
        <span className={styles.label}>Password</span>
        <Autocompleter
          inputRef={inputRef}
          placeholder="Your password..."
          className={styles.authorizationInput}
          onChange={handleInputValueChangePassword}
          value={(authValue as RequestAuthBasic)?.password || ''}
          offsetX={-9}
          offsetY={8}
          environmentId={environmentId}
        />
      </label>
    </div>
  )
}
