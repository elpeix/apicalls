import React, { useEffect, useRef, useState } from 'react'
import styles from './Collections.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import CollectionElement from './CollectionElement'

export default function Collection({
  collection,
  back,
  update,
  remove
}: {
  collection: Collection
  back: () => void
  update: (collection: Collection) => void
  remove: () => void
}) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [coll, setColl] = useState(collection)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setColl(collection)

    if (!collection.name) {
      setEditingName(true)
      setTimeout(() => {
        if (!nameRef.current) return
        nameRef.current.focus()
      }, 0)
    }
  }, [collection])

  const editName = () => {
    setEditingName(true)
    setTimeout(() => {
      if (!nameRef.current) return
      nameRef.current.setSelectionRange(0, coll.name.length)
      nameRef.current.focus()
    }, 0)
  }
  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColl({ ...coll, name: e.target.value })
    update({ ...coll, name: e.target.value })
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingName(false)
    }
    if (e.key === 'Enter') {
      setEditingName(false)
    }
  }

  return (
    <div className={`sidePanel-content ${styles.collection}`}>
      <div className={styles.header}>
        <div className={styles.back}>
          <ButtonIcon icon="arrow" direction="west" onClick={back} />
        </div>
        <div className={styles.title} onClick={editName}>
          {editingName && (
            <input
              ref={nameRef}
              className={styles.nameInput}
              placeholder="Collection name"
              value={coll.name}
              onChange={changeName}
              onBlur={() => setEditingName(false)}
              onKeyDown={onKeyDown}
            />
          )}
          {!editingName && coll.name}
        </div>
        <div className={styles.remove}>
          <ButtonIcon icon="delete" onClick={remove} />
        </div>
      </div>
      <div className={styles.collectionContent}>
        {coll.elements.map((element, i) => (
          <CollectionElement key={i} element={element} />
        ))}
      </div>
    </div>
  )
}
