import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import styles from './SimpleTable.module.css'
import Input from '../Input/Input'
import Autocompleter from '../Autocompleter/Autocompleter'
import { useDebounce } from '../../../hooks/useDebounce'

const SimpleTableContext = createContext<{
  templateColumns: string
  updateColumnWidth: (index: number, width: string) => void
  onDrag: (index: number, offset: number, min?: number, max?: number) => void
  onDragStart: (widths: number[]) => void
}>({
  templateColumns: '',
  updateColumnWidth: () => { },
  onDrag: () => { },
  onDragStart: () => { }
})

const getColumns = (str: string) => str.trim().split(/\s+(?![^(]*\))/g)

export default function SimpleTable({
  templateColumns: initialTemplateColumns,
  children
}: {
  templateColumns: string
  children: React.ReactNode
}) {
  const [columns, setColumns] = useState<string[]>(() => getColumns(initialTemplateColumns))
  const startWidthsRef = useRef<number[]>([])
  const columnsRef = useRef<string[]>(columns)

  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  useEffect(() => {
    setColumns(getColumns(initialTemplateColumns))
  }, [initialTemplateColumns])

  const updateColumnWidth = useCallback((index: number, width: string) => {
    setColumns((prev) => {
      const newColumns = [...prev]
      newColumns[index] = width
      return newColumns
    })
  }, [])

  const onDragStart = useCallback((widths: number[]) => {
    startWidthsRef.current = widths
  }, [])

  const onDrag = useCallback(
    (index: number, offset: number, min?: number, max?: number) => {
      const startWidth = startWidthsRef.current[index]
      if (startWidth !== undefined) {
        const minWidth = min ?? 30
        const maxWidth = max ?? window.innerWidth
        const newWidth = Math.min(Math.max(startWidth + offset, minWidth), maxWidth)
        setColumns((prev) => {
          const newColumns = [...prev]
          newColumns[index] = `${newWidth}px`
          return newColumns
        })
      }
    },
    []
  )

  const templateColumns = columns.join(' ')

  const simpleTableContextValue = {
    templateColumns,
    updateColumnWidth,
    onDrag,
    onDragStart
  }

  return (
    <SimpleTableContext.Provider value={simpleTableContextValue}>
      <div className={styles.simpleTable} role="table">
        {children}
      </div>
    </SimpleTableContext.Provider>
  )
}

function SimpleTableHeader({ children }: { children?: React.ReactNode }) {
  const { templateColumns } = useContext(SimpleTableContext)
  return (
    <div className={styles.header} role="rowgroup" style={{ gridTemplateColumns: templateColumns }}>
      {React.Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child)) {
          const childType = child.type as { displayName?: string; name?: string }
          const isHeaderCell =
            child.type === SimpleTableHeaderCell ||
            childType.displayName === 'SimpleTableHeaderCell' ||
            childType.name === 'SimpleTableHeaderCell'

          if (isHeaderCell) {
            return React.cloneElement(child as React.ReactElement<{ index: number }>, { index })
          }
        }
        return child
      })}
    </div>
  )
}

SimpleTableHeaderCell.displayName = 'SimpleTableHeaderCell'
function SimpleTableHeaderCell({
  draggable = false,
  index,
  minWidth,
  maxWidth,
  children
}: {
  draggable?: boolean
  index?: number
  minWidth?: number
  maxWidth?: number
  children: React.ReactNode
}) {
  const { onDrag: contextOnDrag, onDragStart: contextOnDragStart } = useContext(SimpleTableContext)
  const resizeRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const resizeElement = resizeRef.current
      if (!resizeElement || !draggable || index === undefined) {
        return
      }

      // Measure actual DOM widths of all columns from the header container
      const headerElement = resizeElement.closest(`.${styles.header}`)
      if (headerElement) {
        const cells = Array.from(headerElement.children)
        const widths = cells.map((cell) => cell.getBoundingClientRect().width)
        contextOnDragStart(widths)
      }

      draggingRef.current = true
      resizeElement.classList.add(styles.active)
      startXRef.current = e.clientX
      document.body.style.cursor = 'col-resize !important'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || index === undefined) {
        return
      }
      const delta = e.clientX - startXRef.current
      contextOnDrag(index, delta, minWidth, maxWidth)
    }

    const handleMouseUp = () => {
      if (!draggingRef.current) {
        return
      }
      draggingRef.current = false
      resizeRef.current?.classList.remove(styles.active)
      document.body.style.cursor = ''
    }

    const resizeElement = resizeRef.current
    if (resizeElement) {
      resizeElement.addEventListener('mousedown', handleMouseDown)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (resizeElement) {
        resizeElement.removeEventListener('mousedown', handleMouseDown)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [draggable, index, contextOnDrag, contextOnDragStart, minWidth, maxWidth])

  return (
    <div className={`${styles.cell} ${draggable && styles.draggable}`} role="columnheader">
      <div className={styles.cellHeaderContent}>
        <span>{children}</span>
      </div>
      {draggable && (
        <div ref={resizeRef} className={styles.resize} style={{ cursor: 'col-resize' }} />
      )}
    </div>
  )
}

function SimpleTableBody({
  className = '',
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`${className} ${styles.body}`} role="rowgroup">
      {children}
    </div>
  )
}

function SimpleTableRow({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  const { templateColumns } = useContext(SimpleTableContext)
  return (
    <div
      className={`${styles.row} ${className}`}
      role="row"
      style={{ gridTemplateColumns: templateColumns }}
    >
      {children}
    </div>
  )
}

function SimpleTableCell({
  editable,
  autoFocus,
  value = '',
  placeholder = '',
  onChange,
  changeOnKeyUp = false,
  options,
  children,
  showTip = false,
  scrollContainerRef,
  environmentId,
  className = ''
}: {
  editable?: boolean
  autoFocus?: boolean
  value?: string | React.ReactNode
  placeholder?: string
  onChange?: (value: string) => void
  changeOnKeyUp?: boolean
  options?: string[]
  children?: React.ReactNode
  showTip?: boolean
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  environmentId?: Identifier
  className?: string
}) {
  const [editableValue, setEditableValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [changedValue, setChangedValue] = useState(value)
  const debouncedValue = useDebounce(changedValue, 150)

  useEffect(() => {
    setEditableValue(value)
    setChangedValue(value)
  }, [value])

  useEffect(() => {
    if (editable && autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editable, autoFocus])

  useEffect(() => {
    if (onChange && changeOnKeyUp && debouncedValue !== value && inputFocused) {
      onChange(debouncedValue as string)
    }
  }, [debouncedValue, onChange, value, changeOnKeyUp, inputFocused])

  const handleCellClick = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus()
    }
  }
  const handleChange = (value: string) => {
    setEditableValue(value)
    setChangedValue(value)
  }

  const handleFocus = () => {
    setInputFocused(true)
  }

  const handleBlur = (value: string) => {
    setInputFocused(false)
    if (onChange) {
      onChange(value)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onChange) {
      onChange(editableValue as string)
      if (e.ctrlKey) {
        inputRef.current?.blur()
      }
    }
  }

  return (
    <div className={`${styles.cell} ${className}`} role="cell" onClick={handleCellClick}>
      <div>
        {!!editable && !showTip && (
          <Input
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            value={editableValue as string}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            placeholder={placeholder}
            fontSize={12}
            showTip={showTip}
            autoFocus={autoFocus}
          />
        )}
        {!!editable && showTip && (
          <Autocompleter
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            scrollContainerRef={scrollContainerRef}
            value={editableValue as string}
            options={options}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            placeholder={placeholder}
            fontSize={12}
            autoFocus={autoFocus}
            offsetY={9}
            offsetX={-5}
            environmentId={environmentId}
          />
        )}
        {!editable && <>{value || children}</>}
      </div>
    </div>
  )
}

SimpleTable.Header = SimpleTableHeader
SimpleTable.HeaderCell = SimpleTableHeaderCell
SimpleTable.Body = SimpleTableBody
SimpleTable.Row = SimpleTableRow
SimpleTable.Cell = SimpleTableCell
