import React, { useContext, useEffect, useMemo, useState } from 'react'
import styles from './Input.module.css'
import { AppContext } from '../../../context/AppContext'
import { useDebounce } from '../../../hooks/useDebounce'
import LinkedModal from '../linkedModal/LinkedModal'
import { RequestContext } from '../../../context/RequestContext'

export default function Input({
  inputRef,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyDown,
  placeholder,
  fontSize = 14,
  autoFocus = false,
  highlightVars = false,
  showTip = false,
  zIndexTip = 1,
  environmentId
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  className?: string
  value: string
  onFocus?: () => void
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  fontSize?: number
  autoFocus?: boolean
  highlightVars?: boolean
  showTip?: boolean
  zIndexTip?: number
  environmentId?: Identifier
}) {
  type Variable = {
    part: string
    value: string
  }

  const REGEX = useMemo(() => /\{\{([^}]+)\}\}/i, []) // Get {{variable}} from string

  const { environments, collections } = useContext(AppContext)
  const { collectionId } = useContext(RequestContext)

  const [internalValue, setInternalValue] = useState(value)
  const [onOver, setOnOver] = useState(false)
  const debouncedOnOver = useDebounce(onOver, 700)
  const debouncedValue = useDebounce(internalValue, 700)
  const [variableList, setVariableList] = useState<Variable[]>([])
  const [envId, setEnvId] = useState<Identifier | null | undefined>(null)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    if (environmentId) {
      setEnvId(environmentId)
      return
    }
    if (collectionId) {
      const environmentId = collections?.getEnvironmentId(collectionId)
      if (environmentId) {
        setEnvId(environmentId)
        return
      }
    }
    setEnvId(environments?.getActive()?.id)
  }, [environmentId, environments, collectionId])

  useEffect(() => {
    if (debouncedValue) {
      const variables: Variable[] = []
      internalValue.split(REGEX).forEach((part) => {
        if (envId && environments?.variableIsDefined(envId, part)) {
          variables.push({ part, value: environments.getVariableValue(envId, part) })
        }
      })
      setVariableList(variables)
    }
  }, [debouncedOnOver, internalValue, REGEX, environments, debouncedValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    setInternalValue(target.value)
    if (onChange) onChange(target.value)
  }

  const handleBlur = () => {
    if (onBlur) onBlur(internalValue)
  }

  const highlight = () => {
    if (showTip || highlightVars) {
      return internalValue.split(REGEX).map((part, index) => {
        if (index % 2 === 0) return part
        const className =
          envId && environments?.variableIsDefined(envId, part)
            ? styles.variable
            : styles.variableUndefined
        return <mark key={index} className={className}>{`{{${part}}}`}</mark>
      })
    }
    return internalValue
  }

  const mouseOverHandler = () => setOnOver(true)
  const mouseOutHandler = () => setOnOver(false)

  const showLinkedModal = () => {
    return showTip && debouncedOnOver && variableList.length > 0 && REGEX.test(internalValue)
  }

  const style = { fontSize: `${fontSize}px` }

  return (
    <>
      <div
        className={`${styles.input} ${className || ''}`}
        onMouseOver={mouseOverHandler}
        onMouseOut={mouseOutHandler}
      >
        <div style={style}>
          <div>{highlight()}</div>
        </div>
        <input
          ref={inputRef}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          value={internalValue}
          style={style}
          autoFocus={autoFocus}
        />
      </div>
      {showLinkedModal() && (
        <LinkedModal parentRef={inputRef} topOffset={30} zIndex={zIndexTip}>
          <div
            className={styles.variableList}
            onMouseOver={mouseOverHandler}
            onMouseOut={mouseOutHandler}
          >
            {internalValue.split(REGEX).map((part, index) => {
              if (index % 2 === 0) return null
              const className =
                envId && environments?.variableIsDefined(envId, part)
                  ? styles.variable
                  : styles.variableUndefined
              return (
                <div key={index}>
                  <span key={`${index}_${part}`} className={className}>
                    {part}
                  </span>
                  <span key={`${index}_${value}`} className={styles.variableValue}>
                    {envId && environments?.getVariableValue(envId, part)}
                  </span>
                </div>
              )
            })}
          </div>
        </LinkedModal>
      )}
    </>
  )
}
