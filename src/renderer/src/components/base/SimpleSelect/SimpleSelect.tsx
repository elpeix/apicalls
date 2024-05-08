import React from 'react'
import styles from './SimpleSelect.module.css'

export default function SimpleSelect({
  value = undefined,
  className = '',
  options,
  autoFocus = false,
  onChange = () => {}
}: {
  value: string | number | readonly string[] | undefined
  className?: string
  options: { value: string | number; label: string }[]
  autoFocus?: boolean
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className={`${className} ${styles.simpleSelect}`}>
      <select value={value} onChange={onChange} className={styles.select} autoFocus={autoFocus}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
