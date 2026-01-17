import React, { useContext, useMemo, useRef } from 'react'
import styles from './Settings.module.css'
import SimpleSelect from '../../../base/SimpleSelect/SimpleSelect'
import { AppContext } from '../../../../context/AppContext'
import { WINDOW_ACTIONS } from '../../../../../../lib/ipcChannels'
import ButtonIcon from '../../../base/ButtonIcon'
import Params from '../../../base/Params/Params'
import { defaultHttpHeaders } from '../../../../lib/factory'
import Switch from '../../../base/Switch/Switch'
import Collapsible from '../../../base/Collapsible/Collapsible'

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

  const settings = appSettings?.settings

  const opThemes = useMemo(() => {
    const themes = appSettings?.themes || new Map()
    const computedThemes = [...initOpThemes]
    themes.forEach((theme, key) => {
      computedThemes.push({
        label: theme.name,
        value: key,
        mode: theme.mode
      })
    })
    return computedThemes
  }, [appSettings?.themes])

  if (!settings) return null

  const changeSettings = (newSettings: AppSettingsType) => {
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
    changeSettings({
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
          <Collapsible
            className={styles.section}
            title="Appearance"
            titleClassName={styles.subTitle}
            contentClassName={styles.sectionContent}
          >
            <div className={styles.group}>
              <label htmlFor="theme">Theme</label>
              <SimpleSelect
                value={settings.theme}
                onChange={(e) =>
                  changeSettings({ ...settings, theme: getThemeName(e.target.value) })
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
                    changeSettings({ ...settings, windowMode: getWindowMode(e.target.value) })
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
                  changeSettings({ ...settings, requestView: getRequestView(e.target.value) })
                }
                options={requestViewOptions}
              />
            </div>
            {!window.api.os.isMac && settings.windowMode === 'native' && (
              <div className={styles.switchRow}>
                <Switch
                  text="Show menu"
                  active={settings.menu}
                  onChange={(active) => changeSettings({ ...settings, menu: active })}
                />
              </div>
            )}
          </Collapsible>

          <Collapsible
            className={styles.section}
            title="Behavior"
            titleClassName={styles.subTitle}
            contentClassName={styles.sectionContent}
          >
            <div className={styles.switchRow}>
              <Switch
                text="Scroll to active request"
                active={settings.scrollToActiveRequest}
                onChange={(active) => {
                  changeSettings({ ...settings, scrollToActiveRequest: active })
                }}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Confirm close unsaved tabs"
                active={settings.confirmCloseUnsavedTab ?? true}
                onChange={(active) => {
                  changeSettings({ ...settings, confirmCloseUnsavedTab: active })
                }}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Show notifications"
                active={settings.showNotification ?? true}
                onChange={(active) => {
                  changeSettings({ ...settings, showNotification: active })
                }}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Open links in app"
                active={(settings.linkOpenBehavior ?? 'app') === 'app'}
                onChange={(active) => {
                  changeSettings({
                    ...settings,
                    linkOpenBehavior: active ? 'app' : 'browser'
                  })
                }}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Manage cookies"
                active={settings.manageCookies}
                onChange={(active) => changeSettings({ ...settings, manageCookies: active })}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Save last response"
                active={settings.saveLastResponse}
                onChange={(active) => {
                  changeSettings({ ...settings, saveLastResponse: active })
                }}
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
                  changeSettings({ ...settings, maxHistory: Number(e.target.value) })
                }
              />
            </div>
          </Collapsible>

          <Collapsible
            className={styles.section}
            title="Network"
            titleClassName={styles.subTitle}
            contentClassName={styles.sectionContent}
          >
            <div className={styles.group}>
              <label htmlFor="timeout">Timeout</label>
              <input
                id="timeout"
                type="number"
                min={1}
                max={10000}
                value={settings.timeout}
                placeholder="1000"
                onChange={(e) => changeSettings({ ...settings, timeout: Number(e.target.value) })}
              />
            </div>
            <div className={styles.group}>
              <label htmlFor="proxy">Proxy</label>
              <input
                id="proxy"
                type="text"
                value={settings.proxy || ''}
                placeholder="http://127.0.0.1:8080"
                onChange={(e) => changeSettings({ ...settings, proxy: e.target.value })}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Reject unauthorized SSL"
                active={settings.rejectUnauthorized ?? true}
                onChange={(active) => {
                  changeSettings({ ...settings, rejectUnauthorized: active })
                }}
              />
            </div>
            <div className={styles.switchRow}>
              <Switch
                text="Follow redirect"
                active={settings.followRequestRedirect ?? false}
                onChange={(active) => {
                  changeSettings({ ...settings, followRequestRedirect: active })
                }}
              />
            </div>
            <div className={styles.group}>
              <label>Default headers</label>
              <Params
                items={settings.defaultHeaders || []}
                onSave={(headers) => {
                  changeSettings({ ...settings, defaultHeaders: headers })
                }}
                onAdd={addHeader}
                defaultNameSize={90}
                helperValues={defaultHttpHeaders}
                bulkMode={true}
                draggable={true}
                dragFormat="settings"
                addCaption="Add header"
                removeCaption="Remove header"
                className={styles.defaultHeaders}
                scrollContainerRef={scrollContainerRef}
              />
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
