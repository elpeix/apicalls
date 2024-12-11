import React, { useEffect, useState } from 'react'
import { VERSION } from '../../../../../../lib/ipcChannels'

export default function Versions() {
  const [versions] = useState(window.electron?.process.versions)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(VERSION.get)
    ipcRenderer?.on(VERSION.getSuccess, (_: unknown, version: string) => {
      setAppVersion(version)
    })

    return () => {
      ipcRenderer?.removeAllListeners(VERSION.get)
    }
  }, [setAppVersion])

  return (
    <ul className="versions">
      <VersionValue label="App" value={appVersion} />
      <VersionValue label="Electron" value={versions.electron} />
      <VersionValue label="Chromium" value={versions.chrome} />
      <VersionValue label="Node" value={versions.node} />
      <VersionValue label="V8" value={versions.v8} />
      <VersionValue
        label="Icons"
        value="Solar Outline Icons"
        link="https://www.svgrepo.com/collection/solar-outline-icons/"
      />
    </ul>
  )
}

function VersionValue({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <li>
      <strong>{label}</strong>
      {` `}
      {link && (
        <a href={link} target="_blank" rel="noreferrer">
          {value}
        </a>
      )}
      {!link && value}
    </li>
  )
}
