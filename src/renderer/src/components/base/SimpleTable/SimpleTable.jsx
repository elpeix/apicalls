import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import styles from './SimpleTable.module.css'
import Input from '../Input/Input'

const SimpleTableContext = createContext()

export default function SimpleTable({ templateColumns, children }) {

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

function SimpleTableHeader({ children }) {
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

function SimpleTableHeaderCell({ children }) {
  return (
    <div className={styles.cell} role='columnheader'>
      <div>{ children }</div>
    </div>
  )
}

function SimpleTableBody({ children }) {
  return (
    <div className={styles.body} role='rowgroup'>
      { children }
    </div>
  )
}

function SimpleTableRow({ className, children }) {
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

function SimpleTableCell({ editable, autoFocus, value='', placeholder='', onChange, children }) {

  const [editableValue, setEditableValue] = useState(value)
  const inputRef = useRef()

  useEffect(() => {
    if (editable) {
      setEditableValue(value)
      if (autoFocus) {
        inputRef.current.focus()
      }
    }
  }, [editable, autoFocus, value])

  const handleCellClick = () => {
    if (editable) {
      inputRef.current.focus()
    }
  }
  const handleChange = value => setEditableValue(value)
  const handleBlur = value => {
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
            value={editableValue}
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
