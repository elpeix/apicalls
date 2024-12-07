import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import Input from '../../base/Input/Input'
import { flatRequests } from '../../../lib/collectionFilter'
import { queryFilter } from '../../../lib/utils'
import styles from './FindRequests.module.css'
import { useDebounce } from '../../../hooks/useDebounce'

type FlatRequestWithNode = FlatRequest & { childNode: React.ReactNode }

export default function FindRequests() {
  const { application, collections, tabs } = useContext(AppContext)
  const inputRef = useRef(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [allRequests, setAllRequests] = useState<FlatRequest[]>([])
  const [filter, setFilter] = useState<string>('')
  const debouncedFilter = useDebounce(filter, 200)
  const [filtered, setFiltered] = useState<FlatRequestWithNode[]>([])
  const [selectedFiltered, setSelectedFiltered] = useState(-1)

  useEffect(() => {
    setFilter('')
    const requests = flatRequests(collections?.getAll() || [])
    setAllRequests(requests)
    setFiltered(getAllFlatRequestsWithNode(requests))
    setSelectedFiltered(0)
  }, [collections])

  useEffect(() => {
    setSelectedFiltered(0)
    if (!debouncedFilter) {
      setFiltered(getAllFlatRequestsWithNode(allRequests))
      return
    }
    const lcValue = (debouncedFilter as string).toLowerCase()
    const requestFiltered = allRequests.map((flatRequest) => {
      const filteredWeight = queryFilter(flatRequest.filter.toLowerCase(), lcValue)
      if (filteredWeight > 0) {
        const preparedValues = highlight(flatRequest.filter, lcValue, flatRequest.filterPositions)
        return {
          ...flatRequest,
          weight: filteredWeight,
          childNode: (
            <>
              <div className={styles.foundHead}>
                <div
                  className={styles.collectionName}
                  dangerouslySetInnerHTML={{ __html: preparedValues[0] }}
                />
                <div className={styles.folderPath}>{flatRequest.folderPath}</div>
              </div>
              <div className={styles.request}>
                <div
                  className={`${flatRequest.request.method.value} ${styles.method}`}
                  dangerouslySetInnerHTML={{ __html: preparedValues[1] }}
                />
                <div
                  className={styles.requestName}
                  dangerouslySetInnerHTML={{ __html: preparedValues[2] }}
                />
              </div>
            </>
          )
        }
      }
      return null
    })
    setFiltered(
      requestFiltered
        .filter((item) => item !== null)
        .sort((a, b) => {
          if (a.weight === b.weight) {
            return a.filter.localeCompare(b.filter)
          }
          return b.weight - a.weight
        })
    )
  }, [debouncedFilter, allRequests])

  const getAllFlatRequestsWithNode = (flatRequests: FlatRequest[]): FlatRequestWithNode[] => {
    return flatRequests.map((flatRequest) => {
      return {
        ...flatRequest,
        childNode: (
          <>
            <div className={styles.foundHead}>
              <div className={styles.collectionName}>{flatRequest.collectionName}</div>
              <div className={styles.folderPath}>{flatRequest.folderPath}</div>
            </div>
            <div className={styles.request}>
              <div className={`${flatRequest.request.method.value} ${styles.method}`}>
                {flatRequest.request.method.label}
              </div>
              <div className={styles.requestName}>{flatRequest.name}</div>
            </div>
          </>
        )
      }
    })
  }

  const handleChange = (value: string) => {
    setFilter(value)
  }

  const highlight = (text: string, filter: string, filterPositions: number[]) => {
    const result = ['', '', '']
    let filterIndex = 0
    let position = 0
    const lcText = text.toLowerCase()
    for (let i = 0; i < text.length; i++) {
      if (i === filterPositions[position]) {
        position++
      }
      let character = text[i]
      if (character === '<') {
        character = '&lt;'
      }
      if (lcText[i] === filter[filterIndex]) {
        result[position] += `<span class="${styles.highlight}">${character}</span>`
        filterIndex++
      } else {
        result[position] += character
      }
    }
    return result
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
    const request: RequestType = {
      type: flatRequest.type,
      id: flatRequest.id,
      name: flatRequest.name,
      date: flatRequest.date,
      request: flatRequest.request
    }
    tabs?.openTab({
      request: request,
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
              {item.childNode}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
