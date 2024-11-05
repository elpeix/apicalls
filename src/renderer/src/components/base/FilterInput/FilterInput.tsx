import React, { useEffect, useRef } from 'react'
import Input from '../Input/Input'
import ButtonIcon from '../ButtonIcon'
import styles from './FilterInput.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export const FilterInput = ({
  onFilter,
  onClear
}: {
  onFilter: (value: string) => void
  onClear?: () => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const clearFilter = () => {
    onClear?.()
    inputRef.current?.blur()
  }

  const handleBlur = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeAllListeners(ACTIONS.escape)
  }

  const handleFocus = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.removeAllListeners(ACTIONS.escape)
    ipcRenderer?.once(ACTIONS.escape, clearFilter)
  }

  return (
    <div className={styles.filter}>
      <div className={styles.input}>
        <Input
          inputRef={inputRef}
          placeholder="Filter"
          value=""
          onChange={onFilter}
          onBlur={handleBlur}
          onFocus={handleFocus}
          autoFocus
        />
      </div>
      <ButtonIcon icon="close" onClick={clearFilter} />
    </div>
  )
}
