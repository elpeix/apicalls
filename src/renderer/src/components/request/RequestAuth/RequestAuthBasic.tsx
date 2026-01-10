import React, { useContext, useRef } from 'react'
import styles from './RequestAuth.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Autocompleter from '../../base/Autocompleter/Autocompleter'

export default function RequestAuthBasic() {
  const { request, getRequestEnvironment } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const environmentId = getRequestEnvironment()?.id

  const authValue: RequestAuthBasic = (request?.auth?.value as RequestAuthBasic) || {
    username: '',
    password: ''
  }

  const handleInputValueChangeUsername = (value: string) => {
    request?.setAuth({ type: 'basic', value: { ...authValue, username: value } })
  }

  const handleInputValueChangePassword = (value: string) => {
    request?.setAuth({ type: 'basic', value: { ...authValue, password: value } })
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
          value={authValue?.username || ''}
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
          value={authValue?.password || ''}
          offsetX={-9}
          offsetY={8}
          environmentId={environmentId}
        />
      </label>
    </div>
  )
}
