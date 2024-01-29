import React, { ReactElement } from 'react'
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
  onClick
}: {
  icon: string
  title: string
  onClick: () => void
}) {
  return (
    <div className={styles.item} onClick={onClick}>
      <Icon icon={icon} />
      {title}
    </div>
  )
}

export function MenuSeparator() {
  return <div className={styles.itemSeparator} />
}
