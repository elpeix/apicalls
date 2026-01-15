import React, { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styles from './CollectionSettings.module.css'
import PreRequestEditor from '../PreRequest/PreRequestEditor'
import Editor from '../../../../base/Editor/Editor'
import { Button } from '../../../../base/Buttons/Buttons'
import CollectionScriptEditor from '../CollectionScriptEditor/CollectionScriptEditor'
import Params from '../../../../base/Params/Params'

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

  const handleSave = () => {
    onSave({
      ...collection,
      preRequest: preRequest,
      preScript: preScript,
      postScript: postScript,
      requestHeaders: requestHeaders,
      description: description
    })
    onClose()
  }

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
        <Button.Cancel onClick={onClose}>Cancel</Button.Cancel>
        <Button.Ok onClick={handleSave}>Save</Button.Ok>
      </div>
    </div>
  )
}
