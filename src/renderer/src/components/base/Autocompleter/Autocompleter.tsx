import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import styles from './Autocompleter.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import Input from '../Input/Input'
import { AppContext } from '../../../context/AppContext'

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
  onFocus,
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
  onFocus?: () => void
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

  const [inputValue, setInputValue] = useState(value)
  const [searchValue, setSearchValue] = useState('')
  const [searchIndex, setSearchIndex] = useState(-1)
  const [cursorPosition, setCursorPosition] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selected, setSelected] = useState(0)
  const [maxSuggestionsHeight, setMaxSuggestionsHeight] = useState<number | undefined>(undefined)
  const [width, setWidth] = useState(0)

  // Derived Environment Variables
  const envVariables = useMemo(() => {
    if (!showEnvironmentVariables) return []
    return environments?.getVariables(environmentId)?.map((v) => v.name) || []
  }, [environments, showEnvironmentVariables, environmentId])

  // Derived All Options
  const allOptions = useMemo(() => {
    return [...(options || []), ...envVariables]
  }, [options, envVariables])

  // Derived Suggestions
  const suggestions = useMemo(() => {
    const query = searchValue || inputValue
    if (!query) {
      return allOptions
    }
    return allOptions.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
  }, [allOptions, searchValue, inputValue])

  useLayoutEffect(() => {
    if (!showSuggestions || !inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    const maxHeight = Math.min(Math.max(spaceBelow - 8, 32), 260)
    if (maxHeight < 40 && spaceAbove > spaceBelow) {
      setShowSuggestions(false)
    }
    setMaxSuggestionsHeight(maxHeight)
  }, [showSuggestions, inputRef])

  useLayoutEffect(() => {
    if (showSuggestions && ref.current) {
      setWidth(ref.current.clientWidth)
    }
  }, [showSuggestions])

  // Close suggestions on resize or scroll
  useEffect(() => {
    if (!showSuggestions) return
    const handle = () => setShowSuggestions(false)
    window.addEventListener('resize', handle)

    const scrollContainer = scrollContainerRef?.current
    scrollContainer?.addEventListener('scroll', handle)

    return () => {
      window.removeEventListener('resize', handle)
      scrollContainer?.removeEventListener('scroll', handle)
    }
  }, [showSuggestions, scrollContainerRef])

  const clearSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setSelected(-1)
    setSearchValue('')
    setSearchIndex(-1)
  }, [])

  const assignValue = useCallback(
    (newValue: string, position: number = -1) => {
      setInputValue(newValue)
      onChange?.(newValue)
      if (position > -1) {
        setCursorPosition(position)
      }
    },
    [onChange]
  )

  const setSuggestion = useCallback(
    (suggestion: string) => {
      let valueToAssign = `{{${suggestion}}}`
      let position = valueToAssign.length

      const isPlainOption = options && options.indexOf(suggestion) > -1

      if (isPlainOption) {
        valueToAssign = suggestion
        position = valueToAssign.length
      } else if (searchValue.length > 0) {
        // Replace value from searchIndex and searchValues
        if (searchIndex > -1) {
          valueToAssign =
            inputValue.slice(0, searchIndex) +
            `{{${suggestion}}}` +
            inputValue.slice(searchIndex + searchValue.length)
          position = searchIndex + suggestion.length + 4
        } else {
          // Escape searchValue non \w characters
          const escapedSearchValue = escapeRegExp(searchValue)
          const regex = new RegExp(`${escapedSearchValue}$`)
          if (regex.test(inputValue)) {
            valueToAssign = inputValue.replace(regex, `{{${suggestion}}}`)
          } else {
            const wordRegex = new RegExp(`\\b${escapedSearchValue}\\b`)
            if (wordRegex.test(inputValue)) {
              valueToAssign = inputValue.replace(wordRegex, `{{${suggestion}}}`)
            } else {
              valueToAssign = `${inputValue}{{${suggestion}}}`
            }
          }
        }
      } else if (multiple) {
        valueToAssign = `${inputValue}{{${suggestion}}}`
        position = valueToAssign.length
      }

      assignValue(valueToAssign, position)
      clearSuggestions()
    },
    [options, searchValue, multiple, assignValue, clearSuggestions, searchIndex, inputValue]
  )

  // Sync props to state
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (showSuggestions && ref.current && !ref.current.contains(e.target as Node)) {
        clearSuggestions()
      }
    },
    [showSuggestions, clearSuggestions]
  )

  // Handle Outside Click
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [handleOutsideClick])

  // Set cursor
  useLayoutEffect(() => {
    if (cursorPosition > -1) {
      const timer = setTimeout(() => {
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition)
        setCursorPosition(-1)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [cursorPosition, inputRef])

  const handleFocus = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeListener(ACTIONS.escape, clearSuggestions)
    ipcRenderer?.on(ACTIONS.escape, clearSuggestions)
    onFocus?.()
  }

  const handleBlur = (val: string) => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeListener(ACTIONS.escape, clearSuggestions)
    onBlur?.(val)
  }

  const handleOnChange = (val: string) => {
    assignValue(val)

    if (!val.trim()) {
      clearSuggestions()
      return
    }

    const query = searchValue || val
    const hasMatches = allOptions.some((opt) => opt.toLowerCase().includes(query.toLowerCase()))

    if (hasMatches) {
      setSelected(0)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestions.length === 0) return

      setShowSuggestions(true)
      let newSelected = selected
      if (e.key === 'ArrowUp') {
        newSelected = selected > 0 ? selected - 1 : suggestions.length - 1
      } else {
        newSelected = selected < suggestions.length - 1 ? selected + 1 : 0
      }
      setSelected(newSelected)
      refSuggestions.current?.children[newSelected]?.scrollIntoView({
        block: 'nearest'
      })
      return
    }

    // Ctrl + Space
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault()
      if (suggestions.length === 0 && allOptions.length === 0) return

      if (!showSuggestions) {
        setSearchValue('')
        setSelected(0)
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

    if (e.key === 'Backspace' && searchValue.length > 0) {
      setSearchValue((prev) => prev.slice(0, -1))
    } else if (/\s/.test(e.key)) {
      setSearchValue('')
      clearSuggestions()
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      if (searchValue.length === 0) {
        setSearchIndex(e.currentTarget.selectionStart || -1)
      }
      setSearchValue((prev) => prev + e.key)
    }

    onKeyDown?.(e)
  }

  const handleSuggestionsClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault()
    setSuggestion(e.currentTarget.innerText)
    inputRef.current?.focus()
  }

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
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className={styles.suggestions}
          ref={refSuggestions}
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            // @ts-expect-error - property not yet supported by React types
            positionAnchor: `--${inputId}`,
            width: `${width - offsetX}px`,
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
