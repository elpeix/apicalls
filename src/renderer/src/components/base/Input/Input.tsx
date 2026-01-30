import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'
import styles from './Input.module.css'
import { AppContext } from '../../../context/AppContext'
import { useDebounce } from '../../../hooks/useDebounce'
import LinkedModal from '../linkedModal/LinkedModal'
import { RequestContext } from '../../../context/RequestContext'

type Variable = {
  part: string
  value: string
}

const REGEX = /\{\{([^}]+)\}\}/i // Get {{variable}} from string

export default function Input({
  inputRef,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyDown,
  onPaste = () => {},
  placeholder,
  fontSize = 14,
  autoFocus = false,
  highlightVars = false,
  showTip = false,
  zIndexTip = 1,
  environmentId,
  inputId
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  className?: string
  value: string
  onFocus?: () => void
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
  placeholder?: string
  fontSize?: number
  autoFocus?: boolean
  highlightVars?: boolean
  showTip?: boolean
  zIndexTip?: number
  environmentId?: Identifier
  inputId?: string
}) {
  const { environments, collections } = useContext(AppContext)
  const { collectionId } = useContext(RequestContext)
  const inputWrapperRef = useRef(null)

  // State with value tracking for sync with prop
  const [state, setState] = useState({ value, internalValue: value })
  if (value !== state.value) {
    setState({ value, internalValue: value })
  }
  const { internalValue } = state

  const [onOver, setOnOver] = useState(false)
  const debouncedOnOver = useDebounce(onOver, 500)
  const debouncedValue = useDebounce(internalValue, 700)

  const envId = useMemo(() => {
    if (environmentId) return environmentId
    if (collectionId) {
      const colEnvId = collections?.getEnvironmentId(collectionId)
      if (colEnvId) return colEnvId
    }
    return environments?.getActive()?.id
  }, [environmentId, collectionId, environments, collections])

  const variableList = useMemo(() => {
    if (!debouncedValue) return []
    const variables: Variable[] = []
    internalValue.split(REGEX).forEach((part) => {
      if (envId && environments?.variableIsDefined(envId, part)) {
        variables.push({ part, value: environments.getVariableValue(envId, part) })
      }
    })
    return variables
  }, [debouncedValue, internalValue, environments, envId])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setState((prev) => ({ ...prev, internalValue: newValue }))
      onChange?.(newValue)
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    onBlur?.(internalValue)
  }, [onBlur, internalValue])

  const highlightedValue = useMemo(() => {
    if (showTip || highlightVars) {
      return internalValue.split(REGEX).map((part, index) => {
        if (index % 2 === 0) return part
        const varClassName =
          envId && environments?.variableIsDefined(envId, part)
            ? styles.variable
            : styles.variableUndefined
        return <mark key={`${index}-${part}`} className={varClassName}>{`{{${part}}}`}</mark>
      })
    }
    return internalValue
  }, [internalValue, showTip, highlightVars, envId, environments])

  const mouseOverHandler = useCallback(() => setOnOver(true), [])
  const mouseOutHandler = useCallback(() => setOnOver(false), [])

  const shouldShowLinkedModal = useMemo(
    () => showTip && debouncedOnOver && variableList.length > 0 && REGEX.test(internalValue),
    [showTip, debouncedOnOver, variableList.length, internalValue]
  )

  const style = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      anchorName: inputId ? `--${inputId}` : undefined
    }),
    [fontSize, inputId]
  )

  const variableListContent = useMemo(() => {
    return internalValue.split(REGEX).map((part, index) => {
      if (index % 2 === 0) return null
      const varClassName =
        envId && environments?.variableIsDefined(envId, part)
          ? styles.variable
          : styles.variableUndefined
      return (
        <div key={`${part}-${index}`}>
          <span className={varClassName}>{part}</span>
          <span className={styles.variableValue}>
            {envId && environments?.getVariableValue(envId, part)}
          </span>
        </div>
      )
    })
  }, [internalValue, envId, environments])

  const wrapperClassName = useMemo(
    () => `${styles.input} ${className || ''}`,
    [className]
  )

  return (
    <>
      <div
        className={wrapperClassName}
        onMouseOver={mouseOverHandler}
        onMouseOut={mouseOutHandler}
        ref={inputWrapperRef}
      >
        <div style={style}>
          <div>{highlightedValue}</div>
        </div>
        <input
          ref={inputRef}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          value={internalValue}
          style={style}
          autoFocus={autoFocus}
        />
      </div>
      {shouldShowLinkedModal && (
        <LinkedModal
          parentRef={inputWrapperRef}
          topOffset={28}
          zIndex={zIndexTip}
          className="fadeIn"
          allowOutsideClick={true}
        >
          <div
            className={styles.variableList}
            onMouseOver={mouseOverHandler}
            onMouseOut={mouseOutHandler}
          >
            {variableListContent}
          </div>
        </LinkedModal>
      )}
    </>
  )
}
