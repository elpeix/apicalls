import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import Input from '../../base/Input/Input'
import { flatRequests } from '../../../lib/collectionFilter'
import { queryFilter } from '../../../lib/utils'
import styles from './FindRequests.module.css'

export default function FindRequests() {
  const { application, collections, tabs } = useContext(AppContext)
  const inputRef = useRef(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [allRequests, setAllRequests] = useState<FlatRequest[]>([])
  const [filter, setFilter] = useState('')
  const [filtered, setFiltered] = useState<FlatRequest[]>([])
  const [selectedFiltered, setSelectedFiltered] = useState(-1)

  useEffect(() => {
    setFilter('')
    const requests = flatRequests(collections?.getAll() || [])
    setAllRequests(requests)
    setFiltered(requests)
    setSelectedFiltered(0)
  }, [])

  const handleChange = (value: string) => {
    setFilter(value)
    setSelectedFiltered(0)
    const lcValue = value.toLowerCase()
    setFiltered(allRequests.filter((flatRequest) => queryFilter(flatRequest.filter, lcValue)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) {
      return
    }
    const opts: Record<string, () => void> = {
      ArrowUp: () => {
        if (selectedFiltered <= 0) {
          select(filtered.length - 1)
        } else {
          select(selectedFiltered - 1)
        }
      },
      ArrowDown: () => {
        if (selectedFiltered !== filtered.length - 1) {
          select(selectedFiltered + 1)
        } else {
          select(0)
        }
      },
      PageUp: () => select(Math.max(0, selectedFiltered - 5)),
      PageDown: () => select(Math.min(filtered.length - 1, selectedFiltered + 5)),
      Home: () => select(0),
      End: () => select(filtered.length - 1),
      Enter: () => openRequest(filtered[selectedFiltered])
    }
    if (Object.keys(opts).indexOf(e.key) >= 0) {
      e.preventDefault()
      opts[e.key]()
    }
  }

  const select = (index: number) => {
    setSelectedFiltered(index)
    listRef?.current?.children[index].scrollIntoView({ block: 'nearest' })
  }

  const openRequest = (flatRequest: FlatRequest) => {
    tabs?.openTab({
      request: flatRequest,
      collectionId: flatRequest.collectionId,
      path: flatRequest.path
    })
    application.hideDialog()
  }

  return (
    <div className={styles.dialog}>
      <div className="searchBar">
        <Input
          inputRef={inputRef}
          className={styles.input}
          value={filter}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search requests"
          autoFocus
        />
      </div>
      {filtered && (
        <ul ref={listRef} className={styles.list}>
          {filtered.map((item, index) => (
            <li
              className={index === selectedFiltered ? styles.selected : ''}
              key={`foundItem_${index}`}
              onClick={() => openRequest(item)}
            >
              <div className={styles.collectionName}>{item.collectionName}</div>
              <div className={styles.folderPath}>{item.folderPath}</div>
              <div className={styles.request}>
                <div className={`${item.request.method.value} ${styles.method}`}>
                  {item.request.method.label}
                </div>
                <div className={styles.requestName}>{item.name}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
