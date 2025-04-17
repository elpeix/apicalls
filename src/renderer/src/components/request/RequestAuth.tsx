import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import Autocompleter from '../base/Autocompleter/Autocompleter'

export default function RequestAuth() {
  const { request } = useContext(RequestContext)

  const authOptions: { value: RequestAuthType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer' },
    { value: 'basic', label: 'Basic' }
  ]
  const inputRef = useRef<HTMLInputElement>(null)
  const [authType, setAuthType] = useState<RequestAuthType>(authOptions[0].value)
  const [authValue, setAuthValue] = useState<RequestAuthValue>(null)

  useEffect(() => {
    if (request) {
      setAuthType(request.auth?.type)
      setAuthValue(request.auth?.value)
    }
  }, [request])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = authOptions.find((option) => option.value === e.target.value)
    if (option && option.value !== authType) {
      setAuthType(option.value)
      request?.setAuth({ type: option.value, value: authValue })
    }
  }

  const handleInputValueChange = (value: string) => {
    setAuthValue(value)
    request?.setAuth({ type: authType, value })
  }

  const handleInputValueChangeUsername = (value: string) => {
    const authValueBasic = authValue as RequestAuthBasic
    setAuthValue({ ...authValueBasic, username: value })
    request?.setAuth({ type: authType, value: { ...authValueBasic, username: value } })
  }

  const handleInputValueChangePassword = (value: string) => {
    const authValueBasic = authValue as RequestAuthBasic
    setAuthValue({ ...authValueBasic, password: value })
    request?.setAuth({ type: authType, value: { ...authValueBasic, password: value } })
  }

  return (
    <>
      <div className={`${styles.authorization} ${authType === 'basic' ? styles.basic : ''}`}>
        <SimpleSelect
          options={authOptions}
          value={authType}
          onChange={handleSelectChange}
          className={styles.select}
        />
        {authType === authOptions[1].value && (
          <Autocompleter
            inputRef={inputRef}
            placeholder="Your authorization token..."
            className={styles.authorizationInput}
            onChange={handleInputValueChange}
            value={typeof authValue === 'string' ? authValue : ''}
            offsetX={-9}
            offsetY={8}
          />
        )}
        {authType === authOptions[2].value && (
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
              />
            </label>
          </div>
        )}
      </div>
    </>
  )
}
