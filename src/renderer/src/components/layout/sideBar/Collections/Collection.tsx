import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import CollectionSettings, { CollectionSettingsTab } from './CollectionSettings/CollectionSettings'
import NoteModal from '../../../base/Notes/NoteModal'

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

  // Shadow collection state to isolate local updates (expansion, reordering) from global context
  const [localCollection, setLocalCollection] = useState<Collection>(coll)
  const isDraggingRef = useRef(false)
  const pendingUpdatesRef = useRef(false)

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalCollection(coll)
    }
  }, [coll])

  const commitUpdates = useCallback(() => {
    if (pendingUpdatesRef.current) {
      collections?.update(localCollection)
      pendingUpdatesRef.current = false
    }
  }, [collections, localCollection])

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    commitUpdates()
  }, [commitUpdates])

  const update = useCallback(
    (newCollection: Collection) => {
      setLocalCollection(newCollection)
      pendingUpdatesRef.current = true

      if (!isDraggingRef.current) {
        collections?.update(newCollection)
        pendingUpdatesRef.current = false
      }
    },
    [collections]
  )

  const handleUpdate = () => {
    update({ ...localCollection })
  }

  const filteredElements = useMemo(() => {
    if (filter === '') {
      return localCollection.elements
    }

    const newFiltered = filterCollectionElements(localCollection.elements, filter)

    if (filter === prevFilterRef.current && prevFilteredRef.current.length > 0) {
      syncExpansionState(prevFilteredRef.current, newFiltered)
    }

    return newFiltered
  }, [localCollection.elements, filter])

  const envs = useMemo(() => environments?.getAll() || [], [environments])

  const environmentName = useMemo(() => {
    if (!localCollection.environmentId || !environments) return ''
    const environment = environments.get(localCollection.environmentId)
    return environment?.name || 'unnamed'
  }, [localCollection.environmentId, environments])

  useEffect(() => {
    if (!localCollection.name && !editingName) {
      setEditingName(true)
      setTimeout(() => {
        nameRef.current?.focus()
      }, 0)
    }
  }, [localCollection.name, editingName])

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
        collections?.remove(localCollection.id)
        application.hideConfirm()
        onRemove?.()
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const handleMove = ({ from, to, after }: MoveAction) => {
    document.querySelector('body')?.classList.remove(styles.movingElements)

    const result = moveElements({ elements: localCollection.elements, from, to, after })
    if (result.moved && result.elements) {
      tabs?.updatePaths(localCollection.id, from, to)
      isDraggingRef.current = false
      update({ ...localCollection, elements: result.elements })
    }
  }

  const handleSettings = (tabId?: CollectionSettingsTab) => {
    setShowMenu(false)
    application.showDialog({
      children: (
        <CollectionSettings
          collection={localCollection}
          onSave={update}
          onClose={() => application.hideDialog()}
          activeTabId={tabId}
        />
      ),
      preventKeyClose: false,
      preventOverlayClickClose: true
    })
  }

  const toggleCollection = (expand: boolean) => {
    setShowMenu(false)
    toggleCollectionElements(localCollection.elements, expand)
    update({ ...localCollection })
  }

  const selectEnvironment = (environmentId?: Identifier) => {
    if (localCollection.environmentId === environmentId) {
      collections?.setEnvironmentId(localCollection.id)
      return
    }
    collections?.setEnvironmentId(localCollection.id, environmentId)
  }

  const exportToOpenAPI = () => {
    setShowMenu(false)
    window.electron?.ipcRenderer.send(COLLECTIONS.export, localCollection.id, 'OpenAPI')
  }

  const exportToPostman = () => {
    setShowMenu(false)
    window.electron?.ipcRenderer.send(COLLECTIONS.export, localCollection.id, 'Postman')
  }

  return (
    <div className={`sidePanel-content ${styles.collection}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.back}>
            <ButtonIcon icon="arrow" direction="west" onClick={back} />
          </div>
          <EditableName
            name={localCollection.name}
            editMode={editingName}
            update={changeName}
            editOnDoubleClick={true}
            onBlur={() => setEditingName(false)}
          />
        </div>
        <div className={styles.headerRight}>
          <NoteModal
            value={coll.description}
            iconSize={18}
            className={styles.noteInfo}
            onClickIcon={() => handleSettings('collection-notes')}
          />
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
              leftOffset={-124}
              topOffset={31}
            >
              <MenuElement
                icon="settings"
                title="Settings"
                onClick={() => handleSettings('headers')}
              />
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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
