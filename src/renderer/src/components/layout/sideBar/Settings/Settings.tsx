import React, { useEffect, useState } from 'react'
import Versions from './Versions'
import styles from './Settings.module.css'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    maxHistory: 100,
    timeout: 1000,
    proxy: ''
  })

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('get-settings')
    ipcRenderer.on('settings', (_: any, settings: AppSettings) => setSettings(settings))
    return () => ipcRenderer.removeAllListeners('settings')
  }, [])

  const saveSettings = () => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('save-settings', settings)
  }

  const getThemeName = (value: string): Theme => {
    switch (value) {
      case 'light':
        return 'light'
      case 'dark':
        return 'dark'
      default:
        return 'system'
    }
  }

  return (
    <div className={styles.settings}>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Settings</div>
      </div>
      <div className={`sidePanel-content ${styles.content}`}>
        <div className={styles.main}>
          <div className={styles.group}>
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: getThemeName(e.target.value) })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Auto</option>
            </select>
          </div>
          <div className={styles.group}>
            <label htmlFor="maxHistory">Max History</label>
            <input
              id="maxHistory"
              type="number"
              value={settings.maxHistory}
              min={10}
              max={1000}
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
          <div className={styles.group}>
            <label htmlFor="proxy">Proxy</label>
            <input
              id="proxy"
              type="text"
              value={settings.proxy}
              placeholder="http://localhost:8080"
              onChange={(e) => setSettings({ ...settings, proxy: e.target.value })}
            />
          </div>

          <div className={styles.group}>
            <button onClick={saveSettings}>Save</button>
          </div>
        </div>
      </div>
      <Versions />
    </div>
  )
}
