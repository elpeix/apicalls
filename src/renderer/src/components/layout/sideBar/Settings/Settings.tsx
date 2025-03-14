import React, { useContext, useEffect, useState } from 'react'
import Versions from './Versions'
import styles from './Settings.module.css'
import SimpleSelect from '../../../base/SimpleSelect/SimpleSelect'
import { AppContext } from '../../../../context/AppContext'

const initOpThemes = [
  { label: 'Auto', value: 'system', mode: 'system' },
  { label: 'Light', value: 'light', mode: 'light' },
  { label: 'Dark', value: 'dark', mode: 'dark' },
  { label: 'High Contrast Light', value: 'hc-light', mode: 'high contrast' },
  { label: 'High Contrast Dark', value: 'hc-dark', mode: 'high contrast' }
]

export default function Settings() {
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

  const handleClearSettings = () => {
    application.showConfirm({
      message: 'Are you sure you want to clear settings?',
      onConfirm: () => {
        appSettings?.clear()
        application.hideConfirm()
      },
      onCancel: () => application.hideConfirm()
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

  return (
    <div className={styles.settings}>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Settings</div>
      </div>
      <div className={`sidePanel-content ${styles.content}`}>
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

          <div className={styles.group}>
            <a className={`button-text ${styles.clearSettings}`} onClick={handleClearSettings}>
              Clear settings
            </a>
          </div>
        </div>
      </div>
      <Versions />
    </div>
  )
}
