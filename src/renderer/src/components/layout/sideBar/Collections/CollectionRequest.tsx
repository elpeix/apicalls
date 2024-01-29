import React, { useContext, useState } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import EditableName from '../../../base/EditableName/EditableName'
import Confirm from '../../../base/PopupBoxes/Confirm'

export default function CollectionRequest({
  collectionRequest,
  update,
  remove
}: {
  collectionRequest: RequestType
  update: () => void
  remove: (request: RequestType) => void
}) {
  const { tabs } = useContext(AppContext)
  const { request } = collectionRequest
  const [editingName, setEditingName] = useState(false)
  const [showRemove, setShowRemove] = useState(false)

  const clickHandler = () => {
    if (tabs) {
      tabs.openTab(collectionRequest)
    }
  }
  const changeName = (name: string) => {
    collectionRequest.name = name
    update()
  }

  const handleConfirmRemove = () => {
    setShowRemove(false)
    remove(collectionRequest)
  }

  return (
    <>
      <div className={styles.request} onClick={clickHandler}>
        <div className={`${styles.requestMethod} ${request.method.value}`}>
          {request.method.label}
        </div>
        <EditableName
          name={collectionRequest.name || 'New request'}
          editMode={editingName}
          update={changeName}
          onBlur={() => setEditingName(false)}
        />
        <Menu
          className={styles.menu}
          iconClassName={styles.menuIcon}
          showMenuClassName={styles.menuActive}
        >
          <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
          <MenuSeparator />
          <MenuElement icon="delete" title="Remove" onClick={() => setShowRemove(true)} />
        </Menu>
      </div>

      {showRemove && (
        <Confirm
          message={`Are you sure you want to remove request ${collectionRequest.name}?`}
          confirmName="Remove"
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowRemove(false)}
        />
      )}
    </>
  )
}
