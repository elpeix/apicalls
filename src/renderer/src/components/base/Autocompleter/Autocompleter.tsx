import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styles from './Autocompleter.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import Input from '../Input/Input'
import { AppContext } from '../../../context/AppContext'

export default function Autocompleter({
  inputRef,
  options,
  showEnvironmentVariables = true,
  multiple = true,
  value = '',
  placeholder = '',
  className = '',
  onChange,
  onBlur,
  onKeyUp,
  onKeyDown,
  fontSize = 14,
  autoFocus = false,
  offsetX = 0,
  offsetY = 0
}: {
  inputRef: React.RefObject<HTMLInputElement>
  options?: string[]
  showEnvironmentVariables?: boolean
  value?: string
  multiple?: boolean
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  fontSize?: number
  autoFocus?: boolean
  offsetX?: number
  offsetY?: number
}) {
  const Z_INDEX = 10

  const { environments } = useContext(AppContext)

  const ref = useRef<HTMLDivElement>(null)
  const refSuggestions = useRef<HTMLUListElement>(null)

  const [envVariables, setEnvVariables] = useState<string[]>([])
  const [inputValue, setInputValue] = useState(value)
  const [searchValue, setSearchValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selected, setSelected] = useState(0)
  const [immutableOptions, setImmutableOptions] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const clearSuggestions = useCallback(() => {
    setSuggestions(immutableOptions)
    setShowSuggestions(false)
    setSelected(-1)
    setSearchValue('')
  }, [immutableOptions])

  const assignValue = useCallback(
    (value: string) => {
      setInputValue(value)
      onChange?.(value)
    },
    [onChange, setInputValue]
  )

  const setSuggestion = useCallback(
    (suggestion: string) => {
      let valueToAssing = suggestion
      if (searchValue.length > 0) {
        const regex = new RegExp(`\\b${searchValue}\\b`)
        valueToAssing = inputValue.replace(regex, suggestion)
      } else if (multiple) {
        valueToAssing = `${inputValue}${suggestion}`
      }
      assignValue(valueToAssing)
      clearSuggestions()
    },
    [assignValue, inputValue, multiple, searchValue, clearSuggestions]
  )

  // Set value from props
  useEffect(() => setInputValue(value), [value])

  // Set Environment Variables
  useEffect(() => {
    if (showEnvironmentVariables) {
      const variables = environments?.getVariables()
      if (variables) {
        const tmpVariables = variables.map((variable) => `{{${variable.name}}}`)
        if (tmpVariables.length !== envVariables.length) {
          setEnvVariables(tmpVariables)
          return
        }
        for (let i = 0; i < tmpVariables.length; i++) {
          if (tmpVariables[i] !== envVariables[i]) {
            setEnvVariables(tmpVariables)
            return
          }
        }
      }
    }
  }, [environments, showEnvironmentVariables, envVariables])

  // Set Suggestions
  useEffect(() => {
    const tmpOptions = [...(options || []), ...envVariables]
    setImmutableOptions(tmpOptions)
    setSuggestions(tmpOptions)
  }, [envVariables, options])

  // Handle ESC key
  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on(ACTIONS.escape, () => {
      clearSuggestions()
    })
    return () => ipcRenderer.removeAllListeners(ACTIONS.escape)
  }, [clearSuggestions])

  // Handle Outside Click
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  })

  const handleOutsideClick = (e: MouseEvent) => {
    if (showSuggestions && ref.current && !ref.current.contains(e.target as Node)) {
      clearSuggestions()
    }
  }

  // Handle on Input Change
  const handleOnChange = (value: string) => {
    assignValue(value)
    if (!value.trim()) {
      clearSuggestions()
      return
    }
    const newSuggestions = immutableOptions.filter((option) =>
      option.toLowerCase().includes((searchValue || value).toLowerCase())
    )
    setSuggestions(newSuggestions)
    if (newSuggestions.length > 0) {
      setSelected(0)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle Key Down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestions.length === 0) {
        return
      }
      setShowSuggestions(true)
      let newSelected = selected
      if (e.key === 'ArrowUp') {
        newSelected = selected > 0 ? selected - 1 : suggestions.length - 1
      } else {
        newSelected = selected < suggestions.length - 1 ? selected + 1 : 0
      }
      setSelected(newSelected)
      refSuggestions.current?.children[newSelected].scrollIntoView({
        block: 'nearest'
      })
      return
    }

    // Ctrl + Space
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault()
      if (suggestions.length === 0) {
        return
      }
      if (!showSuggestions) {
        setSuggestions(immutableOptions)
        setSelected(-1)
        setSearchValue('')
      }
      setShowSuggestions(true)
      return
    }

    // Enter or Tab
    if (
      showSuggestions &&
      (e.key === 'Enter' || e.key === 'Tab') &&
      selected >= 0 &&
      selected < suggestions.length
    ) {
      e.preventDefault()
      setSuggestion(suggestions[selected])
      return
    }

    // If the character is imprimeable, save to searchValue
    if (e.key === 'Backspace' && searchValue.length > 0) {
      setSearchValue(searchValue.slice(0, -1))
    } else if (/\s/.test(e.key)) {
      setSearchValue('')
      clearSuggestions()
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      setSearchValue(searchValue + e.key)
    }

    assignValue(e.currentTarget.value)
    onChange?.(e.currentTarget.value)
    onKeyDown?.(e)
  }

  // Handle Click on Suggestions
  const handleSuggestionsClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault()
    setSuggestion(e.currentTarget.innerText)
    inputRef.current?.focus()
  }

  // Handle Mouse Over on Suggestions
  const handleSuggestionMouseDown = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault()
    const children = e.currentTarget.parentElement?.children
    if (children) {
      setSelected(Array.from(children).indexOf(e.currentTarget))
    }
  }

  return (
    <div
      className={`${styles.autocompleter} ${className || ''}`}
      ref={ref}
      onDoubleClick={() => setShowSuggestions(true)}
    >
      <Input
        inputRef={inputRef}
        value={inputValue}
        placeholder={placeholder}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        autoFocus={autoFocus}
        fontSize={fontSize}
        highlightVars={true}
        showTip={!showSuggestions}
        zIndexTip={Z_INDEX}
      />
      {showSuggestions && (
        <ul
          className={styles.suggestions}
          ref={refSuggestions}
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            width: `${ref.current?.clientWidth ?? 0 - offsetX}px`,
            zIndex: Z_INDEX
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={selected === index ? styles.selected : ''}
              onClick={handleSuggestionsClick}
              onMouseOver={handleSuggestionMouseDown}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
