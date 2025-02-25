import React, { CSSProperties, ReactElement } from 'react'
import styles from './Menu.module.css'
import Icon from '../Icon/Icon'

export type ReactMenuElement =
  | ReactElement<typeof MenuElement>
  | Array<ReactElement<typeof MenuElement>>
  | ReactElement<typeof MenuSeparator>
  | Array<ReactElement<typeof MenuSeparator>>

export function MenuElement({
  icon = '',
  showIcon = true,
  title,
  color = '',
  disabled = false,
  className = '',
  onClick
}: {
  icon?: string
  showIcon?: boolean
  title: string
  color?: string
  disabled?: boolean
  className?: string
  onClick: () => void
}) {
  const style: CSSProperties = color ? { color: color } : {}
  return (
    <div
      className={`${styles.item} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {showIcon && <Icon icon={icon} className={className} />}
      <div className={styles.title}>{title}</div>
    </div>
  )
}

export function MenuSeparator() {
  return <div className={styles.itemSeparator} />
}
