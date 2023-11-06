import React, { useContext, useEffect, useState } from 'react'
import styles from './Input.module.css'
import { AppContext } from '../../../context/AppContext'

export default function Input({
  inputRef,
  className,
  value,
  onChange,
  onBlur,
  placeholder,
  fontSize = 14
}) {

  const { environments } = useContext(AppContext)
  const [internalValue, setInternalValue] = useState(value)
  
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = e => {
    setInternalValue(e.target.value)
    if (onChange) onChange(e.target.value)
  }

  const handleBlur = () => {
    if (onBlur) onBlur(internalValue)
  }

  const highlight = () => {
    return internalValue.split(/\{\{([^}]+)\}\}/g).map((part, index) => {
      if (index % 2 === 0) return part
      const className = environments.variableIsDefined(part) ? styles.variable : styles.variableUndefined
      return (<mark title='hola' key={index} className={className}>{`{{${part}}}`}</mark>)
    })
  }

  const style = { fontSize: `${fontSize}px` }

  return (
    <div className={`${styles.input} ${className}`}>
      <div style={style}>
        <div>{highlight()}</div>
      </div>
      <input
        ref={inputRef}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        value={internalValue}
        style={style}
      />
    </div>
  )
}
