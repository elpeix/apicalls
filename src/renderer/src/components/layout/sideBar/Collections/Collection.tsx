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
import { REMOVE_COLOR } from '../../../../constant'

export default function Collection({
  collection,
  back,
  onRemove
}: {
  collection: Collection
  back: () => void
  onRemove?: () => void
}) {
  const { application, tabs, collections } = useContext(AppContext)
  const nameRef = useRef<HTMLInputElement>(null)
  const [coll, setColl] = useState(collection)
  const [editingName, setEditingName] = useState(false)
  // const [showDialog, setShowDialog] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')
  const [showPreRequest, setShowPreRequest] = useState(false)
  const [filteredElements, setFilteredElements] = useState<(CollectionFolder | RequestType)[]>([])
  const [updateTime, setUpdateTime] = useState(0)

  useEffect(() => {
    let internalCollection: Collection | undefined
    if (updateTime !== collections?.updateTime) {
      setUpdateTime(collections?.updateTime || 0)
      internalCollection = collections?.get(coll.id)
    } else {
      internalCollection = coll
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, filter, collections?.updateTime])

  const openCreateFolder = () => {
    application.showPrompt({
      message: 'Folder name:',
      placeholder: 'Folder name',
      confirmName: 'Add',
      onConfirm: createFolderHandler,
      onCancel: () => application.hidePrompt()
    })
  }

  const createFolderHandler = (name: string) => {
    application.hidePrompt()
    coll.elements.push(createFolder(name))
    update({ ...coll })
  }

  const handleUpdate = () => {
    update({ ...coll })
  }

  const editName = () => {
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
    application.showPrompt({
      message: 'Request name:',
      placeholder: 'Request name',
      confirmName: 'Add',
      onConfirm: createRequestHandler,
      onCancel: () => application.hidePrompt()
    })
  }

  const createRequestHandler = (name: string) => {
    application.hidePrompt()
    const request = createRequest({
      name,
      type: 'collection'
    })
    coll.elements.push(request)
    update({ ...coll })
    tabs?.openTab({ request, collectionId: coll.id, path: [{ id: request.id, type: 'request' }] })
  }

  const openRemoveConfirm = () => {
    application.showConfirm({
      message: 'Are you sure you want to remove this collection?',
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: handleRemove,
      onCancel: () => application.hideConfirm()
    })
  }

  const handleRemove = () => {
    collections?.remove(coll.id)
    application.hideConfirm()
    onRemove?.()
  }

  const handleMove = ({ from, to }: { from: PathItem[]; to: PathItem[] }) => {
    const result = moveElements({ elements: coll.elements, from, to })
    if (result.moved && result.elements) {
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
    setShowPreRequest(true)
  }

  const preRequestSave = (data: PreRequest) => {
    update({ ...coll, preRequest: data })
  }

  const toggleCollection = (expand: boolean) => {
    toggleCollectionElements(coll.elements, expand)
    update({ ...coll })
  }

  return (
    <div className={`sidePanel-content ${styles.collection}`}>
      <div className={styles.header}>
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
        <div className={styles.actions}>
          <ButtonIcon icon="filter" title="Filter" onClick={handleShowFilter} />
          <Menu>
            <MenuElement icon="pre" title="Pre request" onClick={handlePreRequest} />
            <MenuElement icon="file" title="Add request" onClick={handleAddRequest} />
            <MenuElement icon="folder" title="Add folder" onClick={openCreateFolder} />
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
              color={REMOVE_COLOR}
              title="Remove"
              onClick={openRemoveConfirm}
            />
          </Menu>
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
          move={handleMove}
          path={[]}
          scrolling={isScrolling}
        />
      </Scrollable>

      {showPreRequest && (
        <PreRequestEditor
          preRequest={coll.preRequest}
          onSave={preRequestSave}
          onClose={() => setShowPreRequest(false)}
        />
      )}
    </div>
  )
}
