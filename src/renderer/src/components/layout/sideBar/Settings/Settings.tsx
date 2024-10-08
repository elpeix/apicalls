import React, { useContext, useEffect, useState } from 'react'
import Versions from './Versions'
import styles from './Settings.module.css'
import Confirm from '../../../base/PopupBoxes/Confirm'
import SimpleSelect from '../../../base/SimpleSelect/SimpleSelect'
import { AppContext } from '../../../../context/AppContext'

export default function Settings() {
  const { appSettings } = useContext(AppContext)
  const [settings, setSettings] = useState<AppSettingsType | null>(null)

  const [showClearSettings, setShowClearSettings] = useState(false)

  useEffect(() => {
    setSettings(appSettings?.settings || null)
  }, [appSettings?.settings])

  const saveSettings = () => {
    if (!settings) return
    appSettings?.save(settings)
  }

  const clearSettings = () => {
    appSettings?.clear()
    setShowClearSettings(false)
  }

  const getThemeName = (value: string): Theme => {
    const allowed = ['light', 'dark', 'system']
    if (!allowed.includes(value)) return 'system'
    return value as Theme
  }

  if (!settings) return null

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

          <div className={styles.group}>
            <button onClick={saveSettings}>Save</button>
            <a className={styles.clearSettings} onClick={() => setShowClearSettings(true)}>
              Clear settings
            </a>
          </div>
        </div>
      </div>
      <Versions />
      {showClearSettings && (
        <Confirm
          message="Are you sure you want to clear settings?"
          onConfirm={clearSettings}
          onCancel={() => setShowClearSettings(false)}
        ></Confirm>
      )}
    </div>
  )
}
