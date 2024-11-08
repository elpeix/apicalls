import React, { useContext, useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../base/ButtonIcon'
import styles from './SearchTabs.module.css'
import Dialog from '../../base/dialog/Dialog'
import { AppContext } from '../../../context/AppContext'
import Input from '../../base/Input/Input'
import { queryFilter } from '../../../lib/utils'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function SearchTabs() {
  const { tabs } = useContext(AppContext)
  const inputRef = useRef(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [show, setShow] = useState(false)
  const [filter, setFilter] = useState('')
  const [filteredTabs, setFilteredTabs] = useState(tabs?.tabs || [])
  const [selectedFilteredTab, setSelectedFilteredTab] = useState(-1)

  useEffect(() => {
    setFilter('')
    setFilteredTabs(tabs?.tabs || [])
    setSelectedFilteredTab(0)

    const ipcRenderer = window.electron?.ipcRenderer
    if (!show) {
      ipcRenderer?.once(ACTIONS.searchTab, () => {
        setShow(true)
      })
    } else {
      ipcRenderer?.removeAllListeners(ACTIONS.searchTab)
    }
    return () => ipcRenderer?.removeAllListeners(ACTIONS.searchTab)
  }, [show, tabs])

  const changeHandler = (value: string) => {
    setFilter(value)
    setSelectedFilteredTab(0)
    setFilteredTabs(
      (tabs?.tabs || []).filter((tab) => {
        const name = tab.name || `${tab.request.method.value} ${tab.request.url}`
        return queryFilter(name.toLowerCase(), value.toLowerCase())
      })
    )
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredTabs.length) {
      return
    }
    const opts: Record<string, () => void> = {
      ArrowUp: () => {
        if (selectedFilteredTab <= 0) {
          select(filteredTabs.length - 1)
        } else {
          select(selectedFilteredTab - 1)
        }
      },
      ArrowDown: () => {
        if (selectedFilteredTab !== filteredTabs.length - 1) {
          select(selectedFilteredTab + 1)
        } else {
          select(0)
        }
      },
      PageUp: () => select(Math.max(0, selectedFilteredTab - 5)),
      PageDown: () => select(Math.min(filteredTabs.length - 1, selectedFilteredTab + 5)),
      Home: () => select(0),
      End: () => select(filteredTabs.length - 1),
      Enter: () => selectTab(filteredTabs[selectedFilteredTab])
    }
    if (Object.keys(opts).indexOf(e.key) >= 0) {
      e.preventDefault()
      opts[e.key]()
    }
  }

  const select = (index: number) => {
    setSelectedFilteredTab(index)
    listRef?.current?.children[index].scrollIntoView({ block: 'nearest' })
  }

  const selectTab = (tab: RequestTab) => {
    const tabIndex = (tabs?.tabs || []).indexOf(tab)
    if (tabIndex < 0) {
      return
    }
    tabs?.setActiveTab(tabIndex)
    setShow(false)
  }

  return (
    <>
      <div className={styles.button}>
        <ButtonIcon icon="search" title="Search tabs" onClick={() => setShow(!show)} />
      </div>
      {show && (
        <Dialog className={styles.tabsDialog} position="top" onClose={() => setShow(false)}>
          <div className={styles.searchBar}>
            <Input
              inputRef={inputRef}
              className={styles.input}
              onChange={changeHandler}
              onKeyDown={keyDownHandler}
              value={filter}
              placeholder="Search opened tabs"
              autoFocus
            />
          </div>
          {filteredTabs && (
            <ul className={styles.tabsList} ref={listRef}>
              {filteredTabs.map((tab, index) => (
                <li
                  className={index === selectedFilteredTab ? styles.selected : ''}
                  key={`searchTabs_${tab.id}`}
                  onClick={() => selectTab(tab)}
                >
                  <div className={styles.tabName}>{tab.name || tab.request.url}</div>
                  <div className={styles.tabRequest}>
                    <div className={`${tab.request.method.value} ${styles.tabRequestMethod}`}>
                      {tab.request.method.label}
                    </div>
                    <div className={styles.tabRequestUrl}>{tab.request.url}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!filteredTabs.length && <div className={styles.noResults}>No matching tabs</div>}
        </Dialog>
      )}
    </>
  )
}
