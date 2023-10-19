import React, { useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'
import styles from './Gutter.module.css'

export default function Gutter({ mode, onDoubleClick }) {

  if ([ 'horizontal', 'vertical' ].indexOf(mode) === -1) {
    throw new Error('Invalid mode')
  }

  const [isDragging, setIsDragging] = useState(false)
  
  return (
    <PanelResizeHandle 
      className={`${styles.gutter} ${styles[mode]} ${isDragging ? styles.drag : ''}`}
      onDragging={setIsDragging} 
    >
      <div className={styles.inset} onDoubleClick={onDoubleClick} />
    </PanelResizeHandle>
  )
}
