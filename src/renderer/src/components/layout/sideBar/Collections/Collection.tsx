import React, { useContext, useEffect, useRef, useState } from 'react'
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
import PreRequestEditor from './PreRequest/PreRequestEditor'
import Scrollable from '../../../base/Scrollable'
import SubMenu from '../../../base/Menu/SubMenu'
import Icon from '../../../base/Icon/Icon'

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
  const [coll, setColl] = useState(collection)
  const [envs, setEnvs] = useState<Environment[]>([])
  const [environmentName, setEnvironmentName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')
  const [filteredElements, setFilteredElements] = useState<(CollectionFolder | RequestType)[]>([])
  const [updateTime, setUpdateTime] = useState(0)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    let internalCollection: Collection | undefined
    if (updateTime !== collections?.updateTime) {
      setUpdateTime(collections?.updateTime || 0)
      internalCollection = collections?.get(collection.id)
    } else {
      internalCollection = collection
    }
    if (!internalCollection) return

    setColl(internalCollection)
    filterElements(filter, internalCollection.elements)

    if (!internalCollection.name) {
      setEditingName(true)
      setTimeout(() => {
        if (!nameRef.current) return
        nameRef.current.focus()
      }, 0)
    }
  }, [collection, filter, collections?.updateTime])

  useEffect(() => {
    if (!environments) {
      return
    }
    setEnvs(environments.getAll())
  }, [environments])

  useEffect(() => {
    if (!coll.environmentId || !environments) {
      setEnvironmentName('')
      return
    }
    const environment = environments.get(coll.environmentId)
    if (!environment) {
      setEnvironmentName('')
      return
    }
    setEnvironmentName(environment.name || 'unnamed')
  }, [coll.environmentId, environments])

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

  const handleUpdate = () => {
    update({ ...coll })
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

  const update = (collection: Collection) => {
    setColl(collection)
    collections?.update(collection)
    filterElements(filter, collection.elements)
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
        update({ ...coll })
        tabs?.openTab({
          request,
          collectionId: coll.id,
          path: [{ id: request.id, type: 'request' }]
        })
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

  const handleShowFilter = () => {
    setFilter('')
    setShowFilter(!showFilter)
  }

  const handleFilter = (filter: string) => {
    filterElements(filter, coll.elements)
  }

  const filterElements = (filter: string, elements: (CollectionFolder | RequestType)[]) => {
    setFilter(filter)
    if (filter === '') {
      setFilteredElements(elements)
      return
    }
    const filtered = filterCollectionElements(elements, filter)
    setFilteredElements(filtered)
  }

  const handlePreRequest = () => {
    setShowMenu(false)
    application.showDialog({
      children: (
        <PreRequestEditor
          preRequest={coll.preRequest}
          onSave={preRequestSave}
          onClose={() => application.hideDialog()}
          environmentId={coll.environmentId}
        />
      ),
      preventKeyClose: true
    })
  }

  const preRequestSave = (data: PreRequest) => {
    update({ ...coll, preRequest: data })
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
              <MenuElement icon="pre" title="Pre request" onClick={handlePreRequest} />
              <>
                {environments && environments.hasItems() && (
                  <SubMenu icon="environment" title="Environment" leftOffset={147}>
                    <>
                      {envs.map((environment) => (
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
                            title="Unlink enviroment"
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
              <MenuElement icon="file" title="Add request" onClick={handleAddRequest} />
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
