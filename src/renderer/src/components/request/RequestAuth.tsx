import React, { useRef, useState } from 'react'
import Input from '../base/Input/Input'
import styles from './Request.module.css'

export default function RequestAuth() {
  const inputRef = useRef()

  const options = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer' }
  ]

  const [selectedOption, setSelectedOption] = useState(options[0])
  const [authValue, setAuthValue] = useState('')

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = options.find((option) => option.value === e.target.value)
    if (option) {
      setSelectedOption(option)
    }
  }

  return (
    <div className={styles.authorization}>
      <select onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedOption.value !== options[0].value && (
        <Input
          value={authValue}
          placeholder="Enter URL..."
          onChange={setAuthValue}
          inputRef={inputRef}
          showTip={true}
          className={styles.authorizationInput}
        />
      )}
    </div>
  )
}
