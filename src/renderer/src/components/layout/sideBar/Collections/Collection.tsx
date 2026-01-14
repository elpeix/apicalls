import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import styles from './Collections.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { createFolder, createRequest } from '../../../../lib/factory'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import CollectionElements from './CollectionElements'
import EditableName from '../../../base/EditableName/EditableName'
import { AppContext } from '../../../../context/AppContext'
import { moveElements } from '../../../../lib/moveElements'
import { FilterInput } from '../../../base/FilterInput/FilterInput'
import {
  filterCollectionElements,
  toggleCollectionElements
} from '../../../../lib/collectionFilter'
import Scrollable from '../../../base/Scrollable'
import SubMenu from '../../../base/Menu/SubMenu'
import Icon from '../../../base/Icon/Icon'
import { COLLECTIONS } from '../../../../../../lib/ipcChannels'
import Note from '../../../base/Notes/Note'
import NoteModal from '../../../base/Notes/NoteModal'
import CollectionSettings from './CollectionSettings/CollectionSettings'

export default function Collection({
  collection,
  back,
  onRemove
}: {
  collection: Collection
  back: () => void
  onRemove?: () => void
}) {
  const { application, tabs, environments, collections } = useContext(AppContext)
  const nameRef = useRef<HTMLInputElement>(null)

  const [editingName, setEditingName] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const prevFilterRef = useRef(filter)
  const prevFilteredRef = useRef<(CollectionFolder | RequestType)[]>([])

  const coll = useMemo(() => {
    // We depend on updateTime to force re-render when collection updates in global store
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    collections?.updateTime
    return collections?.get(collection.id) || collection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, collection, collections?.updateTime])

  const filteredElements = useMemo(() => {
    if (filter === '') {
      return coll.elements
    }

    const newFiltered = filterCollectionElements(coll.elements, filter)

    if (filter === prevFilterRef.current && prevFilteredRef.current.length > 0) {
      syncExpansionState(prevFilteredRef.current, newFiltered)
    }

    return newFiltered
  }, [coll.elements, filter])

  const envs = useMemo(() => environments?.getAll() || [], [environments])

  const environmentName = useMemo(() => {
    if (!coll.environmentId || !environments) return ''
    const environment = environments.get(coll.environmentId)
    return environment?.name || 'unnamed'
  }, [coll.environmentId, environments])

  useEffect(() => {
    prevFilterRef.current = filter
    prevFilteredRef.current = filteredElements
  }, [filter, filteredElements])

  useEffect(() => {
    if (!coll.name && !editingName) {
      setEditingName(true)
      setTimeout(() => {
        nameRef.current?.focus()
      }, 0)
    }
  }, [coll.name, editingName])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    if (!ipcRenderer) return

    const handleFailure = (_: unknown, { message }: { message: string }) => {
      application.showAlert({ message })
    }

    ipcRenderer.on(COLLECTIONS.exportFailure, handleFailure)
    return () => {
      ipcRenderer.removeListener(COLLECTIONS.exportFailure, handleFailure)
    }
  }, [application])

  const update = React.useCallback(
    (newCollection: Collection) => {
      collections?.update(newCollection)
    },
    [collections]
  )

  const handleUpdate = () => {
    update({ ...coll })
  }

  const handleShowFilter = () => {
    setFilter('')
    setShowFilter(!showFilter)
  }

  const handleFilter = (newFilter: string) => {
    setFilter(newFilter)
  }

  const handleCreateFolder = () => {
    setShowMenu(false)
    application.showPrompt({
      message: 'Folder name:',
      placeholder: 'Folder name',
      confirmName: 'Add',
      onConfirm: (name: string) => {
        application.hidePrompt()
        coll.elements.push(createFolder(name))
        update({ ...coll })
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const editName = () => {
    setShowMenu(false)
    setEditingName(true)
    setTimeout(() => {
      if (!nameRef.current) return
      nameRef.current.setSelectionRange(0, coll.name.length)
      nameRef.current.focus()
    }, 0)
  }

  const changeName = (name: string) => {
    setEditingName(false)
    update({ ...coll, name })
  }

  const handleAddRequest = () => {
    setShowMenu(false)
    application.showPrompt({
      message: 'Request name:',
      placeholder: 'Request name',
      confirmName: 'Add',
      onConfirm: (name: string) => {
        application.hidePrompt()
        const request = createRequest({
          name,
          type: 'collection'
        })
        coll.elements.push(request)
        tabs?.openTab({
          request,
          collectionId: coll.id,
          path: [{ id: request.id, type: 'request' }]
        })
        update({ ...coll })
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const handleRemoveCollection = () => {
    setShowMenu(false)
    application.showConfirm({
      message: 'Are you sure you want to remove this collection?',
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        collections?.remove(coll.id)
        application.hideConfirm()
        onRemove?.()
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const handleMove = ({ from, to, after }: MoveAction) => {
    // Force remove className
    document.querySelector('body')?.classList.remove(styles.movingElements)

    const result = moveElements({ elements: coll.elements, from, to, after })
    if (result.moved && result.elements) {
      tabs?.updatePaths(coll.id, from, to)
      update({ ...coll, elements: result.elements })
    }
  }

  const settingsSave = (collection: Collection) => {
    update(collection)
    application.hideDialog()
  }

  const handleSettings = () => {
    setShowMenu(false)
    application.showDialog({
      children: (
        <CollectionSettings
          collection={coll}
          onSave={settingsSave}
          onClose={() => application.hideDialog()}
        />
      ),
      preventKeyClose: false,
      preventOverlayClickClose: true
    })
  }

  const toggleCollection = (expand: boolean) => {
    setShowMenu(false)
    toggleCollectionElements(coll.elements, expand)
    update({ ...coll })
  }

  const selectEnvironment = (environmentId?: Identifier) => {
    if (coll.environmentId === environmentId) {
      collections?.setEnvironmentId(coll.id)
      return
    }
    collections?.setEnvironmentId(coll.id, environmentId)
  }

  const exportToOpenAPI = () => {
    setShowMenu(false)
    window.electron?.ipcRenderer.send(COLLECTIONS.export, coll.id, 'OpenAPI')
  }

  const exportToPostman = () => {
    setShowMenu(false)
    window.electron?.ipcRenderer.send(COLLECTIONS.export, coll.id, 'Postman')
  }

  const editDescription = () => {
    setShowMenu(false)
    application.showDialog({
      children: (
        <Note
          value={coll.description}
          onSave={(description: string) => {
            update({ ...coll, description })
            application.hideDialog()
          }}
          onCancel={() => application.hideDialog()}
        />
      ),
      preventOverlayClickClose: true
    })
  }

  return (
    <div className={`sidePanel-content ${styles.collection}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.back}>
            <ButtonIcon icon="arrow" direction="west" onClick={back} />
          </div>
          <EditableName
            name={coll.name}
            editMode={editingName}
            update={changeName}
            editOnDoubleClick={true}
            onBlur={() => setEditingName(false)}
          />
        </div>
        <div className={styles.headerRight}>
          <NoteModal value={coll.description} iconSize={18} className={styles.noteInfo} />
          {coll.environmentId !== undefined && (
            <div className={styles.collectionEnvironment}>
              <Icon className={styles.environmentIcon} icon="environment" size={16} />
              <div className={styles.environmentName}>{environmentName}</div>
            </div>
          )}
          <div className={styles.actions}>
            <ButtonIcon icon="filter" title="Filter" onClick={handleShowFilter} />
            <Menu
              menuIsOpen={showMenu}
              onOpen={() => setShowMenu(true)}
              onClose={() => setShowMenu(false)}
              preventCloseOnClick={true}
              leftOffset={-123}
              topOffset={31}
            >
              <MenuElement icon="settings" title="Settings" onClick={handleSettings} />
              <>
                {environments && environments.hasItems() && (
                  <SubMenu icon="environment" title="Environment" leftOffset={147}>
                    <>
                      {envs.map((environment: Environment) => (
                        <MenuElement
                          key={`menuEnv_${environment.id}`}
                          title={environment.name}
                          icon={environment.id === coll.environmentId ? 'check' : ''}
                          onClick={() => selectEnvironment(environment.id)}
                        />
                      ))}
                      {coll.environmentId !== undefined && (
                        <>
                          <MenuSeparator />
                          <MenuElement
                            title="Unlink environment"
                            icon="unlink"
                            onClick={() => selectEnvironment()}
                            className={styles.remove}
                          />
                        </>
                      )}
                    </>
                  </SubMenu>
                )}
              </>
              <MenuSeparator />
              <MenuElement icon="more" title="Add request" onClick={handleAddRequest} />
              <MenuElement icon="folder" title="Add folder" onClick={handleCreateFolder} />
              <MenuElement icon="edit" title="Rename" onClick={editName} />
              <MenuSeparator />
              <MenuElement
                icon="expand"
                title="Expand all"
                disabled={filter !== ''}
                onClick={() => toggleCollection(true)}
              />
              <MenuElement
                icon="collapse"
                title="Collapse all"
                disabled={filter !== ''}
                onClick={() => toggleCollection(false)}
              />
              <MenuSeparator />
              <SubMenu title="Export" leftOffset={147} icon="save">
                <MenuElement showIcon={false} title="OpenAPI (Beta)" onClick={exportToOpenAPI} />
                <MenuElement showIcon={false} title="Postman (Beta)" onClick={exportToPostman} />
              </SubMenu>
              <MenuSeparator />
              <MenuElement icon="file" title="Edit description" onClick={editDescription} />
              <MenuSeparator />
              <MenuElement
                icon="delete"
                className={styles.remove}
                title="Remove"
                onClick={handleRemoveCollection}
              />
            </Menu>
          </div>
        </div>
      </div>
      {showFilter && (
        <div className={styles.filter}>
          <FilterInput onClear={handleShowFilter} onFilter={handleFilter} />
        </div>
      )}
      <Scrollable
        className={styles.collectionContent}
        onStartScroll={() => setIsScrolling(true)}
        onEndScroll={() => setIsScrolling(false)}
      >
        <CollectionElements
          collectionId={coll.id}
          elements={filteredElements}
          update={handleUpdate}
          onMove={handleMove}
          path={[]}
          scrolling={isScrolling}
        />
      </Scrollable>
    </div>
  )
}

const syncExpansionState = (
  prevItems: (CollectionFolder | RequestType)[],
  newItems: (CollectionFolder | RequestType)[]
) => {
  const stateMap = new Map<string, boolean>()

  const collect = (items: (CollectionFolder | RequestType)[]) => {
    items.forEach((i) => {
      if (i.type === 'folder') {
        const folder = i as CollectionFolder
        if (folder.expanded !== undefined) {
          stateMap.set(String(folder.id), folder.expanded)
        }
        collect(folder.elements)
      }
    })
  }

  collect(prevItems)

  const apply = (items: (CollectionFolder | RequestType)[]) => {
    items.forEach((i) => {
      if (i.type === 'folder') {
        const folder = i as CollectionFolder
        const id = String(folder.id)
        if (stateMap.has(id)) {
          folder.expanded = stateMap.get(id)
        }
        apply(folder.elements)
      }
    })
  }

  apply(newItems)
}
