import React, { memo, useCallback, useMemo } from 'react'
import styles from './Switch.module.css'

type SwitchProps = {
  text: string
  active?: boolean
  reverse?: boolean
  onChange: (active: boolean) => void
}

const Switch = memo(function Switch({
  text,
  active = false,
  reverse = false,
  onChange
}: SwitchProps) {
  const className = useMemo(
    () =>
      `${styles.interruptor} ${active ? styles.active : ''} ${reverse ? styles.reverse : ''}`,
    [active, reverse]
  )

  const handleClick = useCallback(() => {
    onChange(!active)
  }, [onChange, active])

  return (
    <div className={className} onClick={handleClick}>
      <div className={styles.switch} />
      <div className={styles.text}>{text}</div>
    </div>
  )
})

export default Switch
