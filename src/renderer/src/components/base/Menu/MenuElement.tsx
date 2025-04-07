import React, { CSSProperties, ReactElement } from 'react'
import styles from './Menu.module.css'
import Icon from '../Icon/Icon'
import Accelerator from './Accelerator'

export type ReactMenuElement =
  | ReactElement<typeof MenuElement>
  | Array<ReactElement<typeof MenuElement>>
  | ReactElement<typeof MenuSeparator>
  | Array<ReactElement<typeof MenuSeparator> | null | undefined | false>

export function MenuElement({
  icon = '',
  showIcon = true,
  title,
  accelerator = '',
  color = '',
  disabled = false,
  className = '',
  onClick
}: {
  icon?: string
  showIcon?: boolean
  title: string
  accelerator?: string
  color?: string
  disabled?: boolean
  className?: string
  onClick: () => void
}) {
  const style: CSSProperties = color ? { color: color } : {}
  const menuElementClassName = `${styles.item} ${disabled ? styles.disabled : ''} ${className} ${accelerator ? styles.accelerator : ''}`

  return (
    <div className={menuElementClassName} onClick={onClick} style={style}>
      {showIcon && <Icon icon={icon} className={className} />}
      <div className={styles.title}>{title}</div>
      <Accelerator value={accelerator} />
    </div>
  )
}

export function MenuSeparator() {
  return <div className={styles.itemSeparator} />
}
