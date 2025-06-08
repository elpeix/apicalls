import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Settings.module.css'
import SimpleSelect from '../../../base/SimpleSelect/SimpleSelect'
import { AppContext } from '../../../../context/AppContext'
import { WINDOW_ACTIONS } from '../../../../../../lib/ipcChannels'
import ButtonIcon from '../../../base/ButtonIcon'
import Params from '../../../base/Params/Params'
import { defaultHttpHeaders } from '../../../../lib/factory'

const initOpThemes = [
  { label: 'Auto', value: 'system', mode: 'system' },
  { label: 'Light', value: 'light', mode: 'light' },
  { label: 'Dark', value: 'dark', mode: 'dark' },
  { label: 'High Contrast Light', value: 'hc-light', mode: 'high contrast' },
  { label: 'High Contrast Dark', value: 'hc-dark', mode: 'high contrast' }
]

export default function Settings() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { application, appSettings } = useContext(AppContext)
  const [settings, setSettings] = useState<AppSettingsType | null>(null)
  const [opThemes, setOpThemes] =
    useState<{ label: string; value: string; mode: string }[]>(initOpThemes)

  useEffect(() => {
    setSettings(appSettings?.settings || null)
    const themes = appSettings?.themes || new Map()
    const opThemes = [...initOpThemes]
    themes.forEach((theme, key) => {
      const opTheme = {
        label: theme.name,
        value: key,
        mode: theme.mode
      }
      opThemes.push(opTheme)
    })
    setOpThemes([...opThemes])
  }, [appSettings?.settings])

  if (!settings) return null

  const handleChangeSettings = (newSettings: AppSettingsType) => {
    setSettings(newSettings)
    appSettings?.save(newSettings)
  }

  const handleResetSettings = () => {
    const requiresRestart = !window.api.os.isMac && settings.windowMode === 'native'
    application.showConfirm({
      message: 'Are you sure you want to reset settings?',
      onConfirm: () => {
        appSettings?.clear()
        application.hideConfirm()
        if (requiresRestart) {
          restartApplication('Window view has changed.')
        }
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const addHeader = () => {
    const headers = settings.defaultHeaders || []
    headers.push({
      name: '',
      value: '',
      enabled: true
    } as KeyValue)
    handleChangeSettings({
      ...settings,
      defaultHeaders: headers
    })
  }

  const getThemeName = (value: string): string => {
    return value
  }

  const getRequestView = (value: string): AppSettingsRequestView => {
    const allowed = ['horizontal', 'vertical']
    if (!allowed.includes(value)) return 'horizontal'
    return value as AppSettingsRequestView
  }

  const getWindowMode = (value: string): AppSettingsWindowMode => {
    const allowed = ['custom', 'native']
    if (!allowed.includes(value)) return 'custom'
    return value as AppSettingsWindowMode
  }

  const restartApplication = (message: string = '') => {
    application.showConfirm({
      message: `${message} You need to restart the app for this change to take effect.`,
      onConfirm: () => {
        application.hideConfirm()
        const ipcRenderer = window.electron?.ipcRenderer
        ipcRenderer?.send(WINDOW_ACTIONS.relaunch)
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const requestViewOptions = [
    {
      value: 'horizontal',
      label: 'Horizontal'
    },
    {
      value: 'vertical',
      label: 'Vertical'
    }
  ]

  const windowModeOptions = [
    {
      value: 'custom',
      label: 'Custom'
    },
    {
      value: 'native',
      label: 'Native'
    }
  ]

  return (
    <div className={styles.settings}>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Settings</div>
        <div>
          <ButtonIcon icon="clear" onClick={handleResetSettings} title="Reset settings" />
        </div>
      </div>
      <div className={`sidePanel-content ${styles.content}`} ref={scrollContainerRef}>
        <div className={styles.main}>
          <div className={styles.group}>
            <label htmlFor="theme">Theme</label>
            <SimpleSelect
              value={settings.theme}
              onChange={(e) =>
                handleChangeSettings({ ...settings, theme: getThemeName(e.target.value) })
              }
              options={opThemes}
              groupBy="mode"
            />
          </div>

          {!window.api.os.isMac && (
            <div className={styles.group}>
              <label htmlFor="windowMode">Window view (requires restart)</label>
              <SimpleSelect
                value={settings.windowMode}
                onChange={(e) => {
                  handleChangeSettings({ ...settings, windowMode: getWindowMode(e.target.value) })
                  restartApplication()
                }}
                options={windowModeOptions}
              />
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="requestView">Request view</label>
            <SimpleSelect
              value={settings.requestView}
              onChange={(e) =>
                handleChangeSettings({ ...settings, requestView: getRequestView(e.target.value) })
              }
              options={requestViewOptions}
            />
          </div>
          <div className={styles.group}>
            <label htmlFor="maxHistory">Max History</label>
            <input
              id="maxHistory"
              type="number"
              value={settings.maxHistory}
              min={3}
              max={100}
              placeholder="100"
              onChange={(e) =>
                handleChangeSettings({ ...settings, maxHistory: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.group}>
            <label htmlFor="timeout">Timeout</label>
            <input
              id="timeout"
              type="number"
              min={1}
              max={10000}
              value={settings.timeout}
              placeholder="1000"
              onChange={(e) =>
                handleChangeSettings({ ...settings, timeout: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.groupRow}>
            <input
              id="manageCookies"
              type="checkbox"
              checked={settings.manageCookies}
              onChange={(e) =>
                handleChangeSettings({ ...settings, manageCookies: e.target.checked })
              }
            />
            <label htmlFor="manageCookies">
              <span>Manage cookies</span>
            </label>
          </div>
          {!window.api.os.isMac && settings.windowMode === 'native' && (
            <div className={styles.groupRow}>
              <input
                id="toggleMenu"
                type="checkbox"
                checked={settings.menu}
                onChange={(e) => handleChangeSettings({ ...settings, menu: e.target.checked })}
              />
              <label htmlFor="toggleMenu">
                <span>Show menu</span>
              </label>
            </div>
          )}
          <div className={styles.groupRow}>
            <input
              id="scrollToActiveRequest"
              type="checkbox"
              checked={settings.scrollToActiveRequest ?? true}
              onChange={(e) =>
                handleChangeSettings({ ...settings, scrollToActiveRequest: e.target.checked })
              }
            />
            <label htmlFor="scrollToActiveRequest">
              <span>Scroll to active request</span>
            </label>
          </div>
          <div className={styles.groupRow}>
            <input
              id="confirmCloseUnsavedTab"
              type="checkbox"
              checked={settings.confirmCloseUnsavedTab ?? true}
              onChange={(e) =>
                handleChangeSettings({ ...settings, confirmCloseUnsavedTab: e.target.checked })
              }
            />
            <label htmlFor="confirmCloseUnsavedTab">
              <span>Confirm close unsaved tabs</span>
            </label>
          </div>
          <div className={styles.groupRow}>
            <input
              id="showNotification"
              type="checkbox"
              checked={settings.showNotification ?? true}
              onChange={(e) =>
                handleChangeSettings({ ...settings, showNotification: e.target.checked })
              }
            />
            <label htmlFor="showNotification">
              <span>Show notifications</span>
            </label>
          </div>
          <div className={styles.group}>
            <label>Headers</label>
            <Params
              items={settings.defaultHeaders || []}
              onSave={(headers) => {
                handleChangeSettings({ ...settings, defaultHeaders: headers })
              }}
              onAdd={addHeader}
              maxNameSize={240}
              minNameSize={80}
              helperValues={defaultHttpHeaders}
              bulkMode={true}
              addCaption="Add header"
              removeCaption="Remove header"
              className={styles.defaultHeaders}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
