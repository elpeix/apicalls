import React, { useContext } from 'react'
import styles from './Environment.module.css'
import Name from '../../../base/Name'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Droppable from '../../../base/Droppable/Droppable'
import { AppContext } from '../../../../context/AppContext'

export default function EnvironmentItem({
  environment,
  selectEnvironment,
  activeEnvironment,
  deactiveEnvironment,
  move,
  remove,
  duplicate,
  isScrolling
}: {
  environment: Environment
  selectEnvironment: (environment: Environment) => void
  activeEnvironment: (id: Identifier) => void
  deactiveEnvironment: () => void
  move: (id: Identifier, toBeforeId: Identifier) => void
  remove: (id: Identifier) => void
  duplicate: (id: Identifier) => void
  isScrolling: boolean
}) {
  const { application } = useContext(AppContext)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      activeEnvironment(environment.id)
    } else {
      deactiveEnvironment()
    }
  }

  const clickHandler = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      selectEnvironment(environment)
    } else {
      activeEnvironment(environment.id)
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData('envId', environment.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const envId = e.dataTransfer.getData('envId')
    move(envId, environment.id)
  }

  const handleRemove = () => {
    application.showConfirm({
      message: `Are you sure you want to remove environment ${environment.name}?`,
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        remove(environment.id)
        application.hidePrompt()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  return (
    <Droppable
      className={`sidePanel-content-item ${styles.item}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      dragDecorator="left"
      allowedDropTypes={['envId']}
    >
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
        onClick={clickHandler}
        onDoubleClick={() => selectEnvironment(environment)}
      />
      <Menu
        className={styles.menu}
        iconClassName={styles.menuIcon}
        showMenuClassName={styles.menuActive}
        isMoving={isScrolling}
        leftOffset={-75}
        topOffset={27}
      >
        <MenuElement icon="edit" title="Edit" onClick={() => selectEnvironment(environment)} />
        <MenuElement icon="copy" title="Duplicate" onClick={() => duplicate(environment.id)} />
        <MenuSeparator />
        <MenuElement
          icon="delete"
          title="Remove"
          className={styles.remove}
          onClick={handleRemove}
        />
      </Menu>
    </Droppable>
  )
}
