import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import styles from './SimpleTable.module.css'
import Input from '../Input/Input'
import Autocompleter from '../Autocompleter/Autocompleter'
import { useDebounce } from '../../../hooks/useDebounce'

const SimpleTableContext = createContext<{
  templateColumns: string
}>({
  templateColumns: ''
})

export default function SimpleTable({
  templateColumns,
  children
}: {
  templateColumns: string
  children: React.ReactNode
}) {
  const simpleTableContextValue = {
    templateColumns
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
      {children}
    </div>
  )
}

function SimpleTableHeaderCell({
  draggable = false,
  onDrag = () => {},
  children
}: {
  draggable?: boolean
  onDrag?: (offset: number) => void
  children: React.ReactNode
}) {
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggable) return
    setDragging(true)
    setStartX(e.clientX)
  }
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (!dragging || e.clientX === 0) return
    setStartX(e.clientX)
    onDrag(e.clientX - startX)
  }
  const handleDragEnd = () => {
    setDragging(false)
  }
  return (
    <div className={`${styles.cell} ${draggable && styles.draggable}`} role="columnheader">
      <div>{children}</div>
      <div
        draggable={draggable}
        className={styles.resize}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
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
    if (editable) {
      setEditableValue(value)
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [editable, autoFocus, value])

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
