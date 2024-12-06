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
  title,
  color = '',
  disabled = false,
  className = '',
  onClick
}: {
  icon: string
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
      <Icon icon={icon} className={className} />
      {title}
    </div>
  )
}

export function MenuSeparator() {
  return <div className={styles.itemSeparator} />
}
