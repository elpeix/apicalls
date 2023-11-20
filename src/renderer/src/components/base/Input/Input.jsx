import React, { useContext, useEffect, useMemo, useState } from 'react'
import styles from './Input.module.css'
import { AppContext } from '../../../context/AppContext'
import { useDebounce } from '../../../hooks/useDebounce'
import LinkedModal from '../linkedModal/LinkedModal'

export default function Input({
  inputRef,
  className,
  value,
  onChange,
  onBlur,
  placeholder,
  fontSize = 14
}) {

  const REGEX = useMemo(() => /\{\{([^}]+)\}\}/g, []) // Get {{variable}} from string

  const { environments } = useContext(AppContext)
  const [internalValue, setInternalValue] = useState(value)
  const [onOver, setOnOver] = useState(false)
  const debouncedOnOver = useDebounce(onOver, 500)
  const debouncedValue = useDebounce(internalValue, 500)
  const [variableList, setVariableList] = useState([])
  
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    if (debouncedValue) {
      const variables = []
      internalValue.split(REGEX).forEach(part => {
        if (environments.variableIsDefined(part)) {
          variables.push({part, value: environments.getVariableValue(part)})
        }
      })
      setVariableList(variables)
    }
  }, [debouncedOnOver, internalValue, REGEX, environments, debouncedValue])

  const handleChange = e => {
    setInternalValue(e.target.value)
    if (onChange) onChange(e.target.value)
  }

  const handleBlur = () => {
    if (onBlur) onBlur(internalValue)
  }

  const highlight = () => {
    return internalValue.split(REGEX).map((part, index) => {
      if (index % 2 === 0) return part
      const className = environments.variableIsDefined(part) ? styles.variable : styles.variableUndefined
      return (<mark key={index} className={className}>{`{{${part}}}`}</mark>)
    })
  }

  const mouseOverHandler = () => setOnOver(true)
  const mouseOutHandler = () => setOnOver(false)

  const style = { fontSize: `${fontSize}px` }

  return (
    <>
      <div className={`${styles.input} ${className}`} onMouseOver={mouseOverHandler} onMouseOut={mouseOutHandler}>
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
      { variableList.length > 0 && onOver && debouncedOnOver && (
        <LinkedModal parentRef={inputRef} topOffset={3}>
          <div className={styles.variableList} onMouseOver={mouseOverHandler} onMouseOut={mouseOutHandler}>
            {internalValue.split(REGEX).map((part, index) => {
              if (index % 2 === 0) return null
              const className = environments.variableIsDefined(part) ? styles.variable : styles.variableUndefined
              return (
                <>
                  <span className={className}>{part}</span>
                  <span className={styles.variableValue}>{environments.getVariableValue(part)}</span>
                </>
              )
            })}
          </div>
        </LinkedModal>
      )}
    </>
  )
}
