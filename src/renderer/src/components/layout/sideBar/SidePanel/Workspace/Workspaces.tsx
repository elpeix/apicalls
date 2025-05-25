import React, { useContext, useState } from 'react'
import styles from './Workspaces.module.css'
import Menu from '../../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../../base/Menu/MenuElement'
import { AppContext } from '../../../../../context/AppContext'
import Icon from '../../../../base/Icon/Icon'

export default function Workspaces() {
  const { application, workspaces } = useContext(AppContext)
  const [showMenu, setShowMenu] = useState(false)
  const menuOffset = window.api.os.isMac ? 35 : 28

  if (!workspaces || !workspaces.selectedWorkspace) {
    return null
  }

  const handleCreateWorkspace = () => {
    application.showPrompt({
      message: 'Enter the name of the new workspace:',
      confirmName: 'Create',
      placeholder: 'Workspace name',
      onConfirm: (name) => {
        if (name) {
          workspaces.create(name)
        }
        application.hidePrompt()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const handleDuplicateWorkspace = () => {
    application.showConfirm({
      message: `Are you sure you want to duplicate workspace ${workspaces.selectedWorkspace?.name}?`,
      onConfirm: () => {
        if (!workspaces.selectedWorkspace) {
          console.warn('No workspace selected for duplication')
          return
        }
        workspaces.duplicate(workspaces.selectedWorkspace?.id)
        application.hideConfirm()
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const handleRenameWorkspace = () => {
    application.showPrompt({
      message: 'Enter the new name for the workspace:',
      confirmName: 'Rename',
      placeholder: 'New workspace name',
      value: workspaces.selectedWorkspace?.name,
      onConfirm: (newName) => {
        if (newName && workspaces.selectedWorkspace) {
          workspaces.update(workspaces.selectedWorkspace.id, newName)
          workspaces.select(workspaces.selectedWorkspace.id)
        }
        application.hidePrompt()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const handleRemoveWorkspace = () => {
    application.showConfirm({
      message: `Are you sure you want to remove workspace ${workspaces.selectedWorkspace?.name}?`,
      confirmName: 'Remove',
      onConfirm: () => {
        if (!workspaces.selectedWorkspace) {
          console.warn('No workspace selected for removal')
          return
        }
        workspaces.remove(workspaces.selectedWorkspace.id)
        application.hideConfirm()
      },
      onCancel: () => application.hideConfirm()
    })
  }

  return (
    <div className={styles.workspaces}>
      <div className={styles.content}>
        <Menu
          menuIsOpen={showMenu}
          icon=""
          onOpen={() => setShowMenu(true)}
          onClose={() => setShowMenu(false)}
          leftOffset={0}
          topOffset={menuOffset}
        >
          <MenuElement icon="edit" title="Rename" onClick={handleRenameWorkspace} />
          <MenuElement icon="copy" title="Duplicate" onClick={handleDuplicateWorkspace} />
          {workspaces.selectedWorkspace.id !== 'workspace' && (
            <MenuElement
              icon="delete"
              title="Remove"
              onClick={handleRemoveWorkspace}
              className={styles.remove}
            />
          )}
          <MenuSeparator />
          <div className={styles.menuWorkspaces}>Workspaces</div>
          <div className={styles.menuWorkspacesList}>
            {workspaces.workspaces.map((workspace: WorkspaceType) => (
              <MenuElement
                key={workspace.id}
                icon={workspace.id === workspaces.selectedWorkspace?.id ? 'check' : 'none'}
                title={workspace.name}
                className={`${styles.menuWorkspacesItem} ${workspace.id === workspaces.selectedWorkspace?.id ? styles.active : ''}`}
                onClick={() => {
                  workspaces.select(workspace.id)
                }}
              />
            ))}
          </div>
          <MenuSeparator />
          <MenuElement icon="more" title="Create workspace" onClick={handleCreateWorkspace} />
        </Menu>
        <div
          className={`${styles.name} ${showMenu ? styles.active : ''}`}
          onClick={() => setShowMenu(!showMenu)}
        >
          <div>{workspaces.selectedWorkspace.name}</div>
          <div>
            <Icon className={styles.icon} icon="arrow" />
          </div>
        </div>
      </div>
      <div className={`${styles.workspaceDrag} drag-region`}></div>
    </div>
  )
}
