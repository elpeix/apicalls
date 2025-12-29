import React, { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styles from './CollectionSettings.module.css'
import PreRequestEditor from '../PreRequest/PreRequestEditor'
import { Button } from '../../../../base/Buttons/Buttons'
import CollectionScriptEditor from '../CollectionScriptEditor/CollectionScriptEditor'

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

  const handleSave = () => {
    onSave({
      ...collection,
      preRequest: preRequest,
      preScript: preScript,
      postScript: postScript
    })
    onClose()
  }

  return (
    <div className={styles.settings}>
      <Tabs className="tabs" selectedIndex={activeTab} onSelect={setActiveTab}>
        <TabList>
          <Tab>Pre-Request</Tab>
          <Tab>Pre-Script</Tab>
          <Tab>Post-Script</Tab>
        </TabList>

        <div className="tab-panel-wrapper">
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
        </div>
      </Tabs>
      <div className={styles.footer}>
        <Button.Cancel onClick={onClose}>Cancel</Button.Cancel>
        <Button.Ok onClick={handleSave}>Save</Button.Ok>
      </div>
    </div>
  )
}
