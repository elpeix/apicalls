import React, { useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import styles from './Autocompleter.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import Input from '../Input/Input'
import { AppContext } from '../../../context/AppContext'
import { stringArrayEqual } from '../../../lib/utils'

export default function Autocompleter({
  inputRef,
  scrollContainerRef,
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
  onPaste = () => {},
  fontSize = 14,
  autoFocus = false,
  offsetX = 0,
  offsetY = 0,
  environmentId = 0
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  scrollContainerRef?: React.RefObject<HTMLDivElement | null> | null
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
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
  fontSize?: number
  autoFocus?: boolean
  offsetX?: number
  offsetY?: number
  environmentId?: Identifier
}) {
  const Z_INDEX = 10

  const { environments } = useContext(AppContext)

  const ref = useRef<HTMLDivElement>(null)
  const refSuggestions = useRef<HTMLUListElement>(null)

  const inputId = useId()

  const [envVariables, setEnvVariables] = useState<string[]>([])
  const [inputValue, setInputValue] = useState(value)
  const [searchValue, setSearchValue] = useState('')
  const [searchIndex, setSearchIndex] = useState(-1)
  const [cursorPosition, setCursorPosition] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selected, setSelected] = useState(0)
  const [baseOptions, setBaseOptions] = useState<string[]>(options || [])
  const [immutableOptions, setImmutableOptions] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [maxSuggestionsHeight, setMaxSuggestionsHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!showSuggestions || !inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    const maxHeight = Math.min(Math.max(spaceBelow - 8, 32), 260)
    if (maxHeight < 40 && spaceAbove > spaceBelow) {
      setShowSuggestions(false)
    }
    setMaxSuggestionsHeight(maxHeight)
  }, [showSuggestions, inputRef.current])

  // Close suggestions on resize or scroll
  useEffect(() => {
    if (!showSuggestions) return
    const handle = () => setShowSuggestions(false)
    window.addEventListener('resize', handle)
    scrollContainerRef?.current?.addEventListener('scroll', handle)
    return () => {
      window.removeEventListener('resize', handle)
      scrollContainerRef?.current?.removeEventListener('scroll', handle)
    }
  }, [showSuggestions, scrollContainerRef])

  const clearSuggestions = useCallback(() => {
    setSuggestions(immutableOptions)
    setShowSuggestions(false)
    setSelected(-1)
    setSearchValue('')
    setSearchIndex(-1)
  }, [immutableOptions])

  const assignValue = useCallback(
    (value: string, position: number = -1) => {
      setInputValue(value)
      onChange?.(value)
      if (position > -1) {
        setCursorPosition(position)
      }
    },
    [onChange, setInputValue]
  )

  const setSuggestion = useCallback(
    (suggestion: string) => {
      let valueToAssing = `{{${suggestion}}}`
      let position = valueToAssing.length
      if (options && options.indexOf(suggestion) > -1) {
        valueToAssing = suggestion
        position = valueToAssing.length
      } else if (searchValue.length > 0) {
        // Replace value from searchIndex and searchValues
        if (searchIndex > -1) {
          valueToAssing =
            inputValue.slice(0, searchIndex) +
            `{{${suggestion}}}` +
            inputValue.slice(searchIndex + searchValue.length)
          position = searchIndex + suggestion.length + 4
        } else {
          // Escape searchValue non \w characters
          const escapedSearchValue = searchValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
          const regex = new RegExp(`${escapedSearchValue}$`)
          if (regex.test(inputValue)) {
            valueToAssing = inputValue.replace(regex, `{{${suggestion}}}`)
          } else {
            const wordRegex = new RegExp(`\\b${escapedSearchValue}\\b`)
            if (wordRegex.test(inputValue)) {
              valueToAssing = inputValue.replace(wordRegex, `{{${suggestion}}}`)
            } else {
              valueToAssing = `${inputValue}{{${suggestion}}}`
            }
          }
        }
      } else if (multiple) {
        valueToAssing = `${inputValue}{{${suggestion}}}`
        position = valueToAssing.length
      }
      assignValue(valueToAssing, position)
      clearSuggestions()
    },
    [assignValue, inputValue, multiple, searchValue, clearSuggestions]
  )

  // Set value from props
  useEffect(() => setInputValue(value), [value])

  // Set Environment Variables
  useEffect(() => {
    if (showEnvironmentVariables) {
      const variables = environments?.getVariables(environmentId)
      if (variables) {
        const tmpVariables = variables.map((variable) => `${variable.name}`)
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
  }, [envVariables])

  useEffect(() => {
    if (options !== undefined && !stringArrayEqual(baseOptions, options)) {
      setBaseOptions(options || [])
      const tmpOptions = [...(options || []), ...envVariables]
      setImmutableOptions(tmpOptions)
      setSuggestions(tmpOptions)
    }
  }, [envVariables, options])

  // Handle Outside Click
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  })

  // Set cursor
  useEffect(() => {
    if (cursorPosition > -1) {
      setTimeout(() => {
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition)
        setCursorPosition(-1)
      }, 0) // Wait for the cursor to be set. mmm...
    }
  }, [cursorPosition])

  const handleFocus = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeListener(ACTIONS.escape, clearSuggestions)
    ipcRenderer?.on(ACTIONS.escape, clearSuggestions)
  }

  const handleBlur = (value: string) => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeListener(ACTIONS.escape, clearSuggestions)
    onBlur?.(value)
  }

  const handleOutsideClick = (e: MouseEvent) => {
    if (showSuggestions && ref.current && !ref.current.contains(e.target as Node)) {
      clearSuggestions()
    }
  }

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
      if (searchValue.length === 0) {
        setSearchIndex(e.currentTarget.selectionStart || -1)
      }
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={onPaste}
        autoFocus={autoFocus}
        fontSize={fontSize}
        highlightVars={true}
        showTip={!showSuggestions}
        zIndexTip={Z_INDEX}
        inputId={inputId}
      />
      {showSuggestions && (
        <ul
          className={styles.suggestions}
          ref={refSuggestions}
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            // @ts-expect-error - property not yet supported by React types
            positionAnchor: `--${inputId}`,
            width: `${ref.current?.clientWidth ?? 0 - offsetX}px`,
            zIndex: Z_INDEX,
            maxHeight: maxSuggestionsHeight ? `${maxSuggestionsHeight}px` : '160px',
            overflowY: 'auto'
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
