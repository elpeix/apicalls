import React, { useEffect, useState } from 'react'
import Versions from './Versions'

export default function Settings() {

  const [settings, setSettings] = useState({})
  
  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('get-settings')
    ipcRenderer.on('settings', (_, settings) => setSettings(settings))
    return () => ipcRenderer.removeAllListeners('settings')
  }, [])

  const saveSettings = () => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('save-settings', settings)
  }

  return (
    <div>
      <Versions />

      <div>
        <label htmlFor="timeout">Timeout</label>
        <input
          id="timeout"
          type="number"
          value={settings.timeout}
          onChange={e => setSettings({ ...settings, timeout: e.target.value })}
        />
        <label htmlFor="proxy">Proxy</label>
        <input
          id="proxy"
          type="text"
          value={settings.proxy}
          onChange={e => setSettings({ ...settings, proxy: e.target.value })}
        />
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={settings.theme}
          onChange={e => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">Auto</option>
        </select>
        <button onClick={saveSettings}>Save</button>
      </div>
    </div>
  )
}
