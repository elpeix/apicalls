import React, { useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Collections.module.css'
import CollectionElement from './CollectionElement'

export default function Folder({ folder }) {

  const [expanded, setExpanded] = useState(false)

  const editFolder = () => {
    console.log('edit folder') // TODO
  }

  const toggleExpand = () => setExpanded(!expanded)

  return (
    <div className={styles.folder}>
      <div className={styles.folderHeader}>
        <div>
          <ButtonIcon icon='back' onClick={toggleExpand} />
        </div>
        <div className={styles.folderTitle}>
          {folder.name}
        </div>
        <div className={styles.folderEdit}>
          <ButtonIcon icon='edit' onClick={() => editFolder} />
        </div>
      </div>
      { expanded && (
        <div className={styles.folderContent}>
          {folder.elements.map((element, i) => <CollectionElement key={i} element={element} />)}
        </div>
      )}
    </div>
  )
}
