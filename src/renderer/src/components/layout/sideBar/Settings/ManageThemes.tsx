import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../../base/Buttons/Buttons'
import styles from './ManageThemes.module.css'
import { AppContext } from '../../../../context/AppContext'
import { DIALOG, SETTINGS } from '../../../../../../lib/ipcChannels'
import ButtonIcon from '../../../base/ButtonIcon'
import Icon from '../../../base/Icon/Icon'
import ButtonSelector from '../../../base/Buttons/ButtonSelector'

type OpTheme = {
  label: string
  value: string
  mode: string
  isCustom?: boolean
}

const initOpThemes: OpTheme[] = [
  { label: 'Light', value: 'light', mode: 'light' },
  { label: 'Dark', value: 'dark', mode: 'dark' },
  { label: 'High Contrast Light', value: 'hc-light', mode: 'high contrast' },
  { label: 'High Contrast Dark', value: 'hc-dark', mode: 'high contrast' }
]

const getThemeIcon = (theme: { label: string; value: string; mode: string }) => {
  switch (theme.mode) {
    case 'light':
      return 'sun'
    case 'dark':
      return 'moon'
    case 'high contrast':
      if (theme.value === 'hc-light') {
        return 'sun'
      }
      return 'moon'
    default:
      return 'sun'
  }
}

export default function ManageThemes({ onClose }: { onClose: () => void }) {
  const { appSettings } = useContext(AppContext)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'light' | 'dark' | 'high contrast'>('all')
  const [filterImported, setFilterImported] = useState<'all' | 'custom' | 'bundled'>('all')
  const [importError, setImportError] = useState<string | null>(null)
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = useState(false)

  const opThemes = useMemo(() => {
    const themes = appSettings?.themes || new Map()
    const computedThemes = [...initOpThemes]
    themes.forEach((theme, key) => {
      computedThemes.push({
        label: theme.name,
        value: key,
        mode: theme.mode,
        isCustom: theme.isCustom
      })
    })
    return computedThemes
  }, [appSettings?.themes])

  useEffect(() => {
    const element = listRef.current
    if (!element) return

    const checkScroll = () => {
      setHasScroll(element.scrollHeight > element.clientHeight)
    }

    checkScroll()

    const observer = new ResizeObserver(checkScroll)
    observer.observe(element)

    return () => observer.disconnect()
  }, [opThemes, query, filter, filterImported])

  const clearFilter = () => {
    setFilter('all')
    setFilterImported('all')
  }

  const selectTheme = (theme: string) => {
    const settings = appSettings?.settings
    if (!settings) {
      return
    }
    appSettings?.save({
      ...settings,
      theme
    })
  }

  const isImportedTheme = (theme: string) => {
    return opThemes.find((t) => t.value === theme)?.isCustom
  }

  const deleteTheme = (e: React.MouseEvent, theme: string) => {
    e.stopPropagation()
    setThemeToDelete(theme)
  }

  const confirmDeleteTheme = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!themeToDelete) {
      return
    }

    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.deleteTheme, themeToDelete)

    setThemeToDelete(null)
    if (themeToDelete === appSettings?.settings?.theme) {
      selectTheme('system')
    }
  }

  const cancelDeleteTheme = (e: React.MouseEvent) => {
    e.stopPropagation()
    setThemeToDelete(null)
  }

  const importTheme = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ipcRenderer = window.electron?.ipcRenderer
    if (!ipcRenderer) {
      return
    }

    const cleanup = () => {
      ipcRenderer.removeListener(SETTINGS.importThemeSuccess, successHandler)
      ipcRenderer.removeListener(SETTINGS.importThemeFailure, failureHandler)
    }

    const successHandler = (_: unknown, theme: string) => {
      setImportError(null)
      selectTheme(theme.trim())
      cleanup()
    }

    const failureHandler = (_: unknown, message: string) => {
      setImportError(message)
      cleanup()
    }

    ipcRenderer.once(SETTINGS.importThemeSuccess, successHandler)
    ipcRenderer.once(SETTINGS.importThemeFailure, failureHandler)

    const result = await ipcRenderer.invoke(DIALOG.open, {
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      ipcRenderer.send(SETTINGS.importTheme, result.filePaths[0])
    } else {
      cleanup()
    }
  }

  return (
    <div className={styles.manageThemes}>
      <div className={styles.header}>
        <div className={styles.title}>Manage themes</div>
        <div className={styles.filterContent}>
          <label className={styles.search}>
            <div onDoubleClick={() => setQuery('')} title="Double click to clear">
              <Icon icon="search" />
            </div>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className={styles.filter}>
            <div onDoubleClick={clearFilter} title="Double click to clear">
              <Icon icon="filter" />
            </div>
            <ButtonSelector
              options={[
                { label: 'All', value: 'all' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'High Contrast', value: 'high contrast' }
              ]}
              value={filter}
              onChange={(value) => setFilter(value as 'all' | 'light' | 'dark' | 'high contrast')}
            />
            <ButtonSelector
              options={[
                { label: 'All', value: 'all' },
                { label: 'Custom', value: 'custom' },
                { label: 'Built-in', value: 'bundled' }
              ]}
              value={filterImported}
              onChange={(value) => setFilterImported(value as 'all' | 'custom' | 'bundled')}
            />
          </div>
        </div>
      </div>
      <div className={`${styles.content} ${hasScroll ? styles.hasScroll : ''}`} ref={listRef}>
        {opThemes
          .filter((theme) => filter === 'all' || theme.mode === filter)
          .filter((theme) => theme.label.toLowerCase().includes(query.toLowerCase()))
          .filter(
            (theme) =>
              filterImported === 'all' ||
              (filterImported === 'custom' ? theme.isCustom : !theme.isCustom)
          )
          .map((theme) => {
            return (
              <div
                key={`manageThemes-${theme.value}-${theme.mode}`}
                className={`${styles.theme} ${theme.value === appSettings?.settings?.theme ? styles.selected : ''} ${themeToDelete === theme.value ? styles.deleting : ''}`}
                onClick={() => selectTheme(theme.value)}
              >
                <div className={styles.themeIcon}>
                  <Icon icon={getThemeIcon(theme)} />
                </div>
                <div className={styles.themeName}>{theme.label}</div>
                <div className={styles.themeActions}>
                  {theme.value === appSettings?.settings?.theme && (
                    <div className={styles.selected}>Selected</div>
                  )}
                  {isImportedTheme(theme.value) && themeToDelete !== theme.value && (
                    <ButtonIcon
                      iconClassName={styles.deleteTheme}
                      icon="delete"
                      title="Delete theme"
                      onClick={(e) => deleteTheme(e, theme.value)}
                    />
                  )}
                  {themeToDelete === theme.value && (
                    <>
                      <div className={styles.deleteTheme}>Delete theme?</div>
                      <ButtonIcon
                        iconClassName={styles.deleteTheme}
                        icon="check"
                        title="Confirm delete theme"
                        onClick={confirmDeleteTheme}
                      />
                      <ButtonIcon
                        icon="close"
                        title="Cancel delete theme"
                        onClick={cancelDeleteTheme}
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })}
      </div>
      <div className={styles.footer}>
        <div className={styles.importThemeContainer}>
          <button className={styles.importTheme} onClick={importTheme}>
            <Icon icon="more" />
            Import theme
          </button>
          {importError && <div className={styles.importError}>{importError}</div>}
        </div>
        <Button.Ok onClick={onClose}>Close</Button.Ok>
      </div>
    </div>
  )
}
