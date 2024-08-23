import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'
import SimpleSelect from '../base/SimpleSelect/SimpleSelect'
import Autocompleter from '../base/Autocompleter/Autocompleter'

export default function RequestAuth() {
  const { request } = useContext(RequestContext)

  const authOptions: { value: RequestAuthType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer' }
  ]
  const inputRef = useRef<HTMLInputElement>(null)
  const [authType, setAuthType] = useState<RequestAuthType>(authOptions[0].value)
  const [authValue, setAuthValue] = useState('')

  useEffect(() => {
    if (request) {
      setAuthType(request.auth?.type)
      setAuthValue(request.auth?.value || '')
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

  return (
    <>
      <div className={styles.authorization}>
        <SimpleSelect
          options={authOptions}
          value={authType}
          onChange={handleSelectChange}
          className={styles.select}
        />
        {authType !== authOptions[0].value && (
          <Autocompleter
            inputRef={inputRef}
            placeholder="Your authorization token..."
            className={styles.authorizationInput}
            onChange={handleInputValueChange}
            value={authValue}
            offsetX={-9}
            offsetY={8}
          />
        )}
      </div>
    </>
  )
}
