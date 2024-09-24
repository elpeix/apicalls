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

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.escape, () => {
      inputRef.current?.blur()
      onClear?.()
    })
    return () => ipcRenderer?.removeAllListeners(ACTIONS.escape)
  }, [onClear])

  const clear = () => {
    onClear?.()
  }

  return (
    <div className={styles.filter}>
      <div className={styles.input}>
        <Input inputRef={inputRef} placeholder="Filter" value="" onChange={onFilter} autoFocus />
      </div>
      <ButtonIcon icon="close" onClick={() => clear()} />
    </div>
  )
}
