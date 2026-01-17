import React from 'react'
import styles from './ButtonSelector.module.css'

export default function ButtonSelector({
  options,
  value,
  onChange
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.buttonSelector}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.buttonSelectorOption} ${option.value === value ? styles.active : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
