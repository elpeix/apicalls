import React, { useContext, useMemo, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import Input from '../../base/Input/Input'
import { flatRequests } from '../../../lib/collectionFilter'
import { queryFilter } from '../../../lib/utils'
import styles from './FindRequests.module.css'
import { useDebounce } from '../../../hooks/useDebounce'

type WeightedRequest = FlatRequest & { weight: number }

export default function FindRequests() {
  const { application, collections, tabs } = useContext(AppContext)
  const inputRef = useRef(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [filter, setFilter] = useState<string>('')
  const debouncedFilter = useDebounce(filter, 200)
  const [selectedFiltered, setSelectedFiltered] = useState(0)

  const allRequests = useMemo(() => {
    return flatRequests(collections?.getAll() || [])
  }, [collections])

  const filteredRequests = useMemo(() => {
    if (!debouncedFilter) {
      return allRequests.map((r) => ({ ...r, weight: 0 })).slice(0, 50)
    }

    const lcValue = (debouncedFilter as string).toLowerCase()

    return allRequests
      .map((flatRequest) => {
        const weight = queryFilter(flatRequest.filter.toLowerCase(), lcValue)
        return { ...flatRequest, weight }
      })
      .filter((item) => item.weight > 0)
      .sort((a, b) => {
        if (a.weight === b.weight) {
          return a.filter.localeCompare(b.filter)
        }
        return b.weight - a.weight
      })
      .slice(0, 50) // Limit results for performance
  }, [debouncedFilter, allRequests])

  // Reset selection when results change (state-during-render pattern)
  const [prevRequests, setPrevRequests] = useState(filteredRequests)
  if (filteredRequests !== prevRequests) {
    setPrevRequests(filteredRequests)
    setSelectedFiltered(0)
  }

  const handleChange = (value: string) => {
    setFilter(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredRequests.length) {
      return
    }
    const maxIndex = filteredRequests.length - 1
    const opts: Record<string, () => void> = {
      ArrowUp: () => {
        select(selectedFiltered <= 0 ? maxIndex : selectedFiltered - 1)
      },
      ArrowDown: () => {
        select(selectedFiltered >= maxIndex ? 0 : selectedFiltered + 1)
      },
      PageUp: () => select(Math.max(0, selectedFiltered - 5)),
      PageDown: () => select(Math.min(maxIndex, selectedFiltered + 5)),
      Home: () => select(0),
      End: () => select(maxIndex),
      Enter: () => openRequest(filteredRequests[selectedFiltered])
    }
    if (opts[e.key]) {
      e.preventDefault()
      opts[e.key]()
    }
  }

  const select = (index: number) => {
    setSelectedFiltered(index)
    listRef?.current?.children[index]?.scrollIntoView({ block: 'nearest' })
  }

  const openRequest = (flatRequest: FlatRequest) => {
    if (!flatRequest) return
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
      {filteredRequests.length > 0 && (
        <ul ref={listRef} className={styles.list}>
          {filteredRequests.map((item, index) => (
            <RequestItem
              key={`${item.id}_${index}`}
              item={item}
              filter={debouncedFilter as string}
              isSelected={index === selectedFiltered}
              onClick={() => openRequest(item)}
            />
          ))}
        </ul>
      )}
      {filter && filteredRequests.length === 0 && (
        <div className={styles.noResults}>No results found</div>
      )}
    </div>
  )
}

function RequestItem({
  item,
  filter,
  isSelected,
  onClick
}: {
  item: WeightedRequest
  filter: string
  isSelected: boolean
  onClick: () => void
}) {
  const parts = useMemo(() => {
    if (!filter) {
      return [item.collectionName, item.request?.method?.label, item.name]
    }
    return getHighlightedParts(item.filter, filter, item.filterPositions)
  }, [item.filter, filter, item.filterPositions, item.collectionName, item.request, item.name])

  // parts[0] is Collection Name
  // parts[1] is " Method" (space + method)
  // parts[2] is " Name" (space + name)

  return (
    <li className={isSelected ? styles.selected : ''} onClick={onClick}>
      <div className={styles.foundHead}>
        <div className={styles.collectionName}>{parts[0]}</div>
        <div className={styles.folderPath}>{item.folderPath}</div>
      </div>
      <div className={styles.request}>
        <div className={`${item.request.method.value} ${styles.method}`}>{parts[1]}</div>
        <div className={styles.requestName}>{parts[2]}</div>
      </div>
    </li>
  )
}

function getHighlightedParts(text: string, highlight: string, splitPoints: number[]) {
  const parts: React.ReactNode[][] = [[], [], []]
  let partIndex = 0
  let highlightIndex = 0
  const lcText = text.toLowerCase()
  const lcHighlight = highlight.toLowerCase()

  for (let i = 0; i < text.length; i++) {
    if (i === splitPoints[partIndex]) {
      partIndex++
    }
    if (partIndex >= 3) {
      break
    }

    const char = text[i]
    if (highlightIndex < lcHighlight.length && lcText[i] === lcHighlight[highlightIndex]) {
      parts[partIndex].push(
        <span key={`h_${i}`} className={styles.highlight}>
          {char}
        </span>
      )
      highlightIndex++
    } else {
      parts[partIndex].push(char)
    }
  }
  return parts
}
