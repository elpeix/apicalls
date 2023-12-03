import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import styles from './SimpleTable.module.css'
import Input from '../Input/Input'

const SimpleTableContext = createContext<{
  templateColumns: string
}>({
  templateColumns: ''
})

export default function SimpleTable({ templateColumns, children }: {
  templateColumns: string,
  children: React.ReactNode
}) {

  const simpleTableContextValue = { 
    templateColumns
  }

  return (
    <SimpleTableContext.Provider value={simpleTableContextValue}>
      <div className={styles.simpleTable} role='table'>
        { children }
      </div>
    </SimpleTableContext.Provider>
  )
}

function SimpleTableHeader({ children }: { children?: React.ReactNode }) {
  const { templateColumns } = useContext(SimpleTableContext)
  return (
    <div 
      className={styles.header}
      role='rowgroup' 
      style={{ gridTemplateColumns: templateColumns }}
    >
      { children }
    </div>
  )
}

function SimpleTableHeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.cell} role='columnheader'>
      <div>{ children }</div>
    </div>
  )
}

function SimpleTableBody({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.body} role='rowgroup'>
      { children }
    </div>
  )
}

function SimpleTableRow({ className, children }: {
  className?: string,
  children: React.ReactNode
}) {
  const { templateColumns } = useContext(SimpleTableContext)
  return (
    <div 
      className={`${styles.row} ${className}`}
      role='row'
      style={{ gridTemplateColumns: templateColumns }}
    >
      { children }
    </div>
  )
}

function SimpleTableCell({ editable, autoFocus, value='', placeholder='', onChange, children }: {
  editable?: boolean,
  autoFocus?: boolean,
  value?: string | React.ReactNode,
  placeholder?: string,
  onChange?: (value: string) => void,
  children?: React.ReactNode
}) {

  const [editableValue, setEditableValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (editable) {
      setEditableValue(value)
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [editable, autoFocus, value])

  const handleCellClick = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus()
    }
  }
  const handleChange = (value: string) => setEditableValue(value)
  const handleBlur = (value: string) => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div 
      className={styles.cell} 
      role='cell'
      onClick={handleCellClick}
    >
      <div>
        { !!editable && (
          <Input
            inputRef={inputRef}
            value={editableValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            fontSize={12}
          />) }
        { !editable && <>{value || children}</> }
      </div>
    </div>
  )
}

SimpleTable.Header = SimpleTableHeader
SimpleTable.HeaderCell = SimpleTableHeaderCell
SimpleTable.Body = SimpleTableBody
SimpleTable.Row = SimpleTableRow
SimpleTable.Cell = SimpleTableCell
