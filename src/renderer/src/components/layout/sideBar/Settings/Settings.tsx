import React, { useContext, useEffect, useState } from 'react'
import Versions from './Versions'
import styles from './Settings.module.css'
import SimpleSelect from '../../../base/SimpleSelect/SimpleSelect'
import { AppContext } from '../../../../context/AppContext'

export default function Settings() {
  const { application, appSettings } = useContext(AppContext)
  const [settings, setSettings] = useState<AppSettingsType | null>(null)

  useEffect(() => {
    setSettings(appSettings?.settings || null)
  }, [appSettings?.settings])

  const saveSettings = () => {
    if (!settings) return
    appSettings?.save(settings)
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

  if (!settings) return null

  const getThemeName = (value: string): Theme => {
    const allowed = ['light', 'dark', 'system', 'monokai']
    if (!allowed.includes(value)) return 'system'
    return value as Theme
  }

  const getRequestView = (value: string): AppSettingsRequestView => {
    const allowed = ['horizontal', 'vertical']
    if (!allowed.includes(value)) return 'horizontal'
    return value as AppSettingsRequestView
  }

  const options = [
    {
      value: 'light',
      label: 'Light'
    },
    {
      value: 'dark',
      label: 'Dark'
    },
    {
      value: 'system',
      label: 'Auto'
    },
    {
      value: 'monokai',
      label: 'Monokai'
    }
  ]

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
              onChange={(e) => setSettings({ ...settings, theme: getThemeName(e.target.value) })}
              options={options}
            />
          </div>
          <div className={styles.group}>
            <label htmlFor="requestView">Request view</label>
            <SimpleSelect
              value={settings.requestView}
              onChange={(e) =>
                setSettings({ ...settings, requestView: getRequestView(e.target.value) })
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
              onChange={(e) => setSettings({ ...settings, maxHistory: Number(e.target.value) })}
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
              onChange={(e) => setSettings({ ...settings, timeout: Number(e.target.value) })}
            />
          </div>
          <div className={styles.groupRow}>
            <input
              id="manageCookies"
              type="checkbox"
              checked={settings.manageCookies}
              onChange={(e) => setSettings({ ...settings, manageCookies: e.target.checked })}
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
              onChange={(e) => setSettings({ ...settings, menu: e.target.checked })}
            />
            <label htmlFor="toggleMenu">
              <span>Show menu</span>
            </label>
          </div>

          <div className={styles.group}>
            <button onClick={saveSettings}>Save</button>
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
