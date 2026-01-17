import React, { useState } from 'react'
import styles from './Collapsible.module.css'
import ButtonIcon from '../ButtonIcon'

export default function Collapsible({
  title,
  className,
  titleClassName,
  contentClassName,
  children
}: {
  title: string
  className?: string
  titleClassName?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className={`${styles.collapsible} ${className}`}>
      <div className={styles.header} onClick={() => setOpen(!open)}>
        <div>
          <ButtonIcon icon="arrow" direction={open ? 'south' : 'east'} />
        </div>
        <div className={titleClassName}>{title}</div>
      </div>
      <div className={`${styles.content} ${open ? styles.open : styles.closed}`}>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  )
}
