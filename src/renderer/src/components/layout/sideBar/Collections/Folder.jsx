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
          <ButtonIcon icon='arrow' direction={expanded ? 'south' : 'east'} onClick={toggleExpand} />
        </div>
        <div className={styles.folderTitle} onClick={toggleExpand}>
          {folder.name}
        </div>
        <div className={styles.folderEdit}>
          <ButtonIcon icon='edit' onClick={() => editFolder} />
        </div>
      </div>
      { expanded && folder.elements && (
        <div className={styles.folderContent}>
          {folder.elements.map((element, i) => <CollectionElement key={i} element={element} />)}
        </div>
      )}
    </div>
  )
}
