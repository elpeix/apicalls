import React from 'react'
import styles from './Menu.module.css'

export default function Accelerator({ value }: { value: string }) {
  if (!value) return null
  const modifiersArray = value.split('+')
  const modifiersString = modifiersArray.map((modifier) => {
    switch (modifier.toLowerCase()) {
      case 'cmd':
        return '⌘'
      case 'ctrl':
        return window.api.os.isMac ? '⌃' : 'Ctrl'
      case 'alt':
        return window.api.os.isMac ? '⌥' : 'Alt'
      case 'shift':
        return window.api.os.isMac ? '⇧' : 'Shift'
      case 'cmdorctrl':
        return window.api.os.isMac ? '⌘' : 'Ctrl'
      case 'plus':
        return '+'
      default:
        return modifier
    }
  })
  const acceleratorString = `${modifiersString.join('+')}`

  return <div className={styles.accelerator}>{acceleratorString}</div>
}
