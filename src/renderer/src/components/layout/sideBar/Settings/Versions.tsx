import React, { useEffect, useState } from 'react'
import { VERSION } from '../../../../../../lib/ipcChannels'

function Versions() {
  const [versions] = useState(window.electron.process.versions)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send(VERSION.get)
    ipcRenderer.on(VERSION.getSuccess, (_: unknown, version: string) => {
      setAppVersion(version)
    })

    return () => {
      ipcRenderer.removeAllListeners(VERSION.get)
    }
  }, [setAppVersion])

  return (
    <ul className="versions">
      <li className="app-version">App v{appVersion}</li>
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
      <li className="v8-version">V8 v{versions.v8}</li>
    </ul>
  )
}

export default Versions
