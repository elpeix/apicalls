import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import styles from './SimpleTable.module.css'
import Input from '../Input/Input'
import Autocompleter from '../Autocompleter/Autocompleter'
import { useDebounce } from '../../../hooks/useDebounce'

const SimpleTableContext = createContext<{
  templateColumns: string
  updateColumnWidth: (index: number, width: string) => void
  onDrag: (index: number, offset: number) => void
  onDragStart: (index: number) => void
}>({
  templateColumns: '',
  updateColumnWidth: () => {},
  onDrag: () => {},
  onDragStart: () => {}
})

export default function SimpleTable({
  templateColumns: initialTemplateColumns,
  children
}: {
  templateColumns: string
  children: React.ReactNode
}) {
  const [columns, setColumns] = useState<string[]>(initialTemplateColumns.split(' '))
  const startWidthsRef = useRef<number[]>([])

  const updateColumnWidth = (index: number, width: string) => {
    const newColumns = [...columns]
    newColumns[index] = width
    setColumns(newColumns)
  }

  const onDragStart = (_index: number) => {
    startWidthsRef.current = columns.map((c) => parseInt(c) || 0)
  }

  const onDrag = (index: number, offset: number) => {
    const startWidth = startWidthsRef.current[index]
    if (startWidth !== undefined) {
      const newWidth = Math.max(startWidth + offset, 20) // Min width 20px
      const newColumns = [...columns]
      newColumns[index] = `${newWidth}px`
      setColumns(newColumns)
    }
  }

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
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === SimpleTableHeaderCell) {
          return React.cloneElement(child as React.ReactElement<{ index: number }>, { index })
        }
        return child
      })}
    </div>
  )
}

function SimpleTableHeaderCell({
  draggable = false,
  index,
  children
}: {
  draggable?: boolean
  index?: number
  children: React.ReactNode
}) {
  const { onDrag: contextOnDrag, onDragStart: contextOnDragStart } = useContext(SimpleTableContext)
  const resizeRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!resizeRef.current || !draggable || index === undefined) {
        return
      }
      contextOnDragStart(index)
      draggingRef.current = true
      resizeRef.current?.classList.add(styles.active)
      startXRef.current = e.clientX
      document.body.style.cursor = 'col-resize !important'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || index === undefined) {
        return
      }
      const delta = e.clientX - startXRef.current
      contextOnDrag(index, delta)
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
  }, [draggable, index, contextOnDrag, contextOnDragStart])

  return (
    <div className={`${styles.cell} ${draggable && styles.draggable}`} role="columnheader">
      <div className={styles.cellHeaderContent}>{children}</div>
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
