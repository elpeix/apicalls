import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import styles from './Collections.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { createFolder, createRequest } from '../../../../lib/factory'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import FolderCreator from './FolderCreator'
import Confirm from '../../../base/PopupBoxes/Confirm'
import CollectionElements from './CollectionElements'
import EditableName from '../../../base/EditableName/EditableName'
import { AppContext } from '../../../../context/AppContext'
import RequestCreator from './RequestCreator'
import { moveElements } from '../../../../lib/moveElements'
import { FilterInput } from '../../../base/FilterInput/FilterInput'
import { filterCollectionElements } from '../../../../lib/collectionFilter'
import PreRequestEditor from './PreRequest/PreRequestEditor'

export default function Collection({
  collection,
  back,
  onRemove
}: {
  collection: Collection
  back: () => void
  onRemove?: () => void
}) {
  const { tabs, collections } = useContext(AppContext)
  const nameRef = useRef<HTMLInputElement>(null)
  const [coll, setColl] = useState(collection)
  const [editingName, setEditingName] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showCreateRequest, setShowCreateRequest] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
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

  const createFolderHandler = (name: string) => {
    setShowCreateFolder(false)
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
    setShowCreateRequest(true)
  }

  const createRequestHandler = (name: string) => {
    setShowCreateRequest(false)
    const request = createRequest({
      name,
      type: 'collection'
    })
    coll.elements.push(request)
    update({ ...coll })
    tabs?.openTab({ request, collectionId: coll.id, path: [{ id: request.id, type: 'request' }] })
  }

  const handleEndScroll = useMemo(() => {
    let timeout: NodeJS.Timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setIsScrolling(false)
      }, 100)
    }
  }, [])

  const handleScroll = () => {
    setIsScrolling(true)
    handleEndScroll()
  }

  const handleRemove = () => {
    collections?.remove(coll.id)
    setShowDialog(false)
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
            <MenuElement
              icon="folder"
              title="Add folder"
              onClick={() => setShowCreateFolder(true)}
            />
            <MenuElement icon="edit" title="Rename" onClick={editName} />
            <MenuSeparator />
            <MenuElement icon="delete" title="Remove" onClick={() => setShowDialog(true)} />
          </Menu>
        </div>
      </div>
      {showFilter && (
        <div className={styles.filter}>
          <FilterInput onClear={handleShowFilter} onFilter={handleFilter} />
        </div>
      )}
      <div className={styles.collectionContent} onScroll={handleScroll}>
        <CollectionElements
          collectionId={coll.id}
          elements={filteredElements}
          update={handleUpdate}
          move={handleMove}
          path={[]}
          scrolling={isScrolling}
        />
      </div>
      {showDialog && (
        <Confirm
          message="Are you sure you want to remove this collection?"
          confirmName="Remove"
          onConfirm={handleRemove}
          onCancel={() => setShowDialog(false)}
        />
      )}

      {showCreateFolder && (
        <FolderCreator onCancel={() => setShowCreateFolder(false)} onCreate={createFolderHandler} />
      )}

      {showCreateRequest && (
        <RequestCreator
          onCancel={() => setShowCreateRequest(false)}
          onCreate={createRequestHandler}
        />
      )}

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
