import React, { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styles from './CollectionSettings.module.css'
import PreRequestEditor from '../PreRequest/PreRequestEditor'
import { Button } from '../../../../base/Buttons/Buttons'
import CollectionScriptEditor from '../CollectionScriptEditor/CollectionScriptEditor'
import Params from '../../../../base/Params/Params'

export default function CollectionSettings({
  collection,
  onSave,
  onClose
}: {
  collection: Collection
  onSave: (collection: Collection) => void
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [preRequest, setPreRequest] = useState<PreRequest | undefined>(collection.preRequest)
  const [preScript, setPreScript] = useState(collection.preScript || '')
  const [postScript, setPostScript] = useState(collection.postScript || '')
  const [requestHeaders, setRequestHeaders] = useState<KeyValue[]>(collection.requestHeaders || [])
  const [description, setDescription] = useState(collection.description || '')

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
          <Tab>Headers</Tab>
          <Tab>Pre-Request</Tab>
          <Tab>Pre-Script</Tab>
          <Tab>Post-Script</Tab>
          <Tab>Collection notes</Tab>
        </TabList>

        <div className="tab-panel-wrapper">
          <TabPanel forceRender={true}>
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
          </TabPanel>
          <TabPanel forceRender={true}>
            <PreRequestEditor
              preRequest={preRequest}
              onSave={setPreRequest}
              environmentId={collection.environmentId}
            />
          </TabPanel>
          <TabPanel>
            <CollectionScriptEditor script={preScript} onSave={setPreScript} />
          </TabPanel>
          <TabPanel>
            <CollectionScriptEditor script={postScript} onSave={setPostScript} />
          </TabPanel>
          <TabPanel forceRender={true}>
            <div className={styles.description}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type your collection notes here..."
                autoFocus
              />
            </div>
          </TabPanel>
        </div>
      </Tabs>
      <div className={styles.footer}>
        <Button.Cancel onClick={onClose}>Cancel</Button.Cancel>
        <Button.Ok onClick={handleSave}>Save</Button.Ok>
      </div>
    </div>
  )
}
