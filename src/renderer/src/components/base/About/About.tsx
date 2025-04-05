import React, { useContext, useEffect, useState } from 'react'
import { VERSION } from '../../../../../lib/ipcChannels'
import AppIcon from '../../../assets/icons/app.svg'
import styles from './About.module.css'
import { AppContext } from '../../../context/AppContext'

export default function About() {
  const { application } = useContext(AppContext)
  const [versions] = useState(window.electron?.process.versions)
  const [appVersion, setAppVersion] = useState('')
  const link = 'https://github.com/elpeix/apicalls'

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
    <div className={styles.about}>
      <div className={styles.appIcon}>
        <img src={AppIcon} width={96} height={96} />
      </div>
      <div className={styles.appName}>API Calls</div>
      <div>
        <a className="link" href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      </div>
      <ul className={styles.versions}>
        <VersionValue label="Version" value={appVersion} />
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
      <button
        onClick={() => {
          application.hideDialog()
        }}
      >
        Close
      </button>
    </div>
  )
}

function VersionValue({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <li>
      <strong>{label}</strong>
      {` `}
      {link && (
        <a className="link" href={link} target="_blank" rel="noreferrer">
          {value}
        </a>
      )}
      {!link && value}
    </li>
  )
}
