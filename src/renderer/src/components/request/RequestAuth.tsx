import React, { useContext, useEffect, useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'
import { RequestContext } from '../../context/RequestContext'

export default function RequestAuth() {
  const { request } = useContext(RequestContext)
  const inputRef = useRef()

  const authOptions: { value: RequestAuthType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer' }
  ]

  const [authType, setAuthType] = useState<RequestAuthType>('none')
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
    <div className={styles.authorization}>
      <select onChange={handleSelectChange} value={authType}>
        {authOptions.map((option) => (
          <option key={option.value} value={option.value} selected={authType === option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {authType !== authOptions[0].value && (
        <Input
          value={authValue}
          placeholder="Your authorization token..."
          onChange={handleInputValueChange}
          inputRef={inputRef}
          showTip={true}
          className={styles.authorizationInput}
        />
      )}
    </div>
  )
}
