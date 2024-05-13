import React, { useEffect, useState } from 'react'
import { VERSION_GET, VERSION_GET_SUCCESS } from '../../../../../../lib/ipcChannels'

function Versions() {
  const ipcRenderer = window.electron.ipcRenderer
  const [versions] = useState(window.electron.process.versions)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    ipcRenderer.send(VERSION_GET)
    ipcRenderer.on(VERSION_GET_SUCCESS, (_: unknown, version: string) => {
      setAppVersion(version)
    })

    return () => {
      ipcRenderer.removeAllListeners(VERSION_GET)
    }
  }, [setAppVersion])
  console.log(window.electron.version)

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
