import React, { useRef } from 'react'
import Input from '../Input/Input'
import ButtonIcon from '../ButtonIcon'
import styles from './FilterInput.module.css'

export const FilterInput = ({
  onFilter,
  onClear
}: {
  onFilter: (value: string) => void
  onClear?: () => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
      clear()
    }
  }

  const clear = () => {
    onClear?.()
    onFilter('')
  }

  return (
    <div className={styles.filter}>
      <div className={styles.input}>
        <Input
          inputRef={inputRef}
          placeholder="Filter"
          value=""
          onChange={onFilter}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <ButtonIcon icon="close" onClick={() => clear()} />
    </div>
  )
}
