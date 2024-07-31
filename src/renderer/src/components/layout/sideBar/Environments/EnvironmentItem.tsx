import React, { useState } from 'react'
import styles from './Environment.module.css'
import Name from '../../../base/Name'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Confirm from '../../../base/PopupBoxes/Confirm'

export default function EnvironmentItem({
  environment,
  selectEnvironment,
  activeEnvironment,
  deactiveEnvironment,
  remove,
  duplicate,
  isScrolling
}: {
  environment: Environment
  selectEnvironment: (environment: Environment) => void
  activeEnvironment: (id: Identifier) => void
  deactiveEnvironment: () => void
  remove: (id: Identifier) => void
  duplicate: (id: Identifier) => void
  isScrolling: boolean
}) {
  const [showDialog, setShowDialog] = useState(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      activeEnvironment(environment.id)
    } else {
      deactiveEnvironment()
    }
  }

  return (
    <div className={`sidePanel-content-item ${styles.item}`}>
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={environment.active}
          onClick={(e) => e.stopPropagation()}
          onChange={onChange}
        />
      </div>
      <Name
        className={styles.title}
        name={environment.name}
        onClick={() => selectEnvironment(environment)}
      />
      <Menu
        className={styles.menu}
        iconClassName={styles.menuIcon}
        showMenuClassName={styles.menuActive}
        isMoving={isScrolling}
      >
        <MenuElement icon="edit" title="Edit" onClick={() => selectEnvironment(environment)} />
        <MenuElement icon="copy" title="Duplicate" onClick={() => duplicate(environment.id)} />
        <MenuSeparator />
        <MenuElement icon="delete" title="Remove" onClick={() => setShowDialog(true)} />
      </Menu>
      {showDialog && (
        <Confirm
          message="Are you sure you want to remove this environment?"
          onConfirm={() => remove(environment.id)}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </div>
  )
}
