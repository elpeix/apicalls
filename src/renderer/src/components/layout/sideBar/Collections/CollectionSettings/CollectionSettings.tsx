import React, { useEffect, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styles from './CollectionSettings.module.css'
import PreRequestEditor from '../PreRequest/PreRequestEditor'
import Editor from '../../../../base/Editor/Editor'
import { Button } from '../../../../base/Buttons/Buttons'
import CollectionScriptEditor from '../CollectionScriptEditor/CollectionScriptEditor'
import { ACTIONS } from '../../../../../../../lib/ipcChannels'
import Params from '../../../../base/Params/Params'
import { deepMatches } from '../../../../../lib/utils'

export type CollectionSettingsTab =
  | 'headers'
  | 'pre-request'
  | 'pre-script'
  | 'post-script'
  | 'collection-notes'

export default function CollectionSettings({
  collection,
  onSave,
  onClose,
  activeTabId = 'headers'
}: {
  collection: Collection
  onSave: (collection: Collection) => void
  onClose: () => void
  activeTabId?: CollectionSettingsTab
}) {
  const [preRequest, setPreRequest] = useState<PreRequest | undefined>(collection.preRequest)
  const [preScript, setPreScript] = useState(collection.preScript || '')
  const [postScript, setPostScript] = useState(collection.postScript || '')
  const [requestHeaders, setRequestHeaders] = useState<KeyValue[]>(collection.requestHeaders || [])
  const [description, setDescription] = useState(collection.description || '')

  const [baseline, setBaseline] = useState({
    preRequest: collection.preRequest,
    preScript: collection.preScript || '',
    postScript: collection.postScript || '',
    requestHeaders: collection.requestHeaders || [],
    description: collection.description || ''
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseline({
      preRequest: collection.preRequest,
      preScript: collection.preScript || '',
      postScript: collection.postScript || '',
      requestHeaders: collection.requestHeaders || [],
      description: collection.description || ''
    })
  }, [collection])

  const tabs = [
    {
      id: 'headers',
      label: 'Headers',
      forceRender: true,
      children: (
        <div className={styles.headers}>
          <Params
            items={requestHeaders}
            onSave={setRequestHeaders}
            onAdd={() =>
              setRequestHeaders([...requestHeaders, { name: '', value: '', enabled: true }])
            }
            defaultNameSize={200}
            bulkMode={false}
            draggable={true}
            dragFormat="collection-headers"
            addCaption="Add header"
            removeCaption="Remove header"
          />
        </div>
      )
    },
    {
      id: 'pre-request',
      label: 'Pre-Request',
      forceRender: true,
      children: (
        <PreRequestEditor
          preRequest={preRequest}
          onSave={setPreRequest}
          environmentId={collection.environmentId}
        />
      )
    },
    {
      id: 'pre-script',
      label: 'Pre-Script',
      forceRender: false,
      children: <CollectionScriptEditor script={preScript} onSave={setPreScript} />
    },
    {
      id: 'post-script',
      label: 'Post-Script',
      forceRender: false,
      children: <CollectionScriptEditor script={postScript} onSave={setPostScript} />
    },
    {
      id: 'collection-notes',
      label: 'Collection notes',
      forceRender: true,
      children: (
        <div className={styles.description}>
          <Editor
            value={description}
            onChange={(value: string | undefined) => setDescription(value || '')}
            language="markdown"
            type="none"
            wordWrap={true}
            readOnly={false}
          />
        </div>
      )
    }
  ]

  const tabIdToIndex = (id: string) => {
    return tabs.findIndex((tab) => tab.id === id)
  }

  const [activeTab, setActiveTab] = useState(tabIdToIndex(activeTabId || 'headers'))

  const saveChanges = React.useCallback(() => {
    onSave({
      ...collection,
      preRequest: preRequest,
      preScript: preScript,
      postScript: postScript,
      requestHeaders: requestHeaders,
      description: description
    })
    setBaseline({
      preRequest,
      preScript,
      postScript,
      requestHeaders,
      description
    })
  }, [collection, preRequest, preScript, postScript, requestHeaders, description, onSave])

  const hasChanges = React.useMemo(() => {
    return (
      !deepMatches(preRequest, baseline.preRequest) ||
      preScript !== baseline.preScript ||
      postScript !== baseline.postScript ||
      !deepMatches(requestHeaders, baseline.requestHeaders) ||
      description !== baseline.description
    )
  }, [
    preRequest,
    baseline.preRequest,
    preScript,
    baseline.preScript,
    postScript,
    baseline.postScript,
    requestHeaders,
    baseline.requestHeaders,
    description,
    baseline.description
  ])

  const handleSave = () => {
    if (hasChanges) {
      saveChanges()
    }
    onClose()
  }

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    if (!ipcRenderer) return

    const handleSaveShortcut = () => {
      if (hasChanges) {
        saveChanges()
      }
    }

    ipcRenderer.on(ACTIONS.saveRequest, handleSaveShortcut)

    return () => {
      ipcRenderer.removeListener(ACTIONS.saveRequest, handleSaveShortcut)
    }
  }, [saveChanges, hasChanges])

  return (
    <div className={styles.settings}>
      <Tabs className="tabs" selectedIndex={activeTab} onSelect={setActiveTab}>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={`${tab.id}-tab`}>{tab.label}</Tab>
          ))}
        </TabList>

        <div className="tab-panel-wrapper">
          {tabs.map((tab) => (
            <TabPanel key={`${tab.id}-tab-panel`} forceRender={tab.forceRender}>
              {tab.children}
            </TabPanel>
          ))}
        </div>
      </Tabs>
      <div className={styles.footer}>
        {hasChanges && <span className={styles.warning}>Unsaved changes</span>}
        <div className={styles.buttons}>
          {hasChanges && <Button.Cancel onClick={onClose}>Cancel</Button.Cancel>}
          <Button.Ok onClick={handleSave}>{hasChanges ? 'Save & Close' : 'Close'}</Button.Ok>
        </div>
      </div>
    </div>
  )
}
