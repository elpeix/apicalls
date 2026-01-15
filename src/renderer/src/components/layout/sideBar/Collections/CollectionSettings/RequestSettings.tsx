import React, { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styles from './RequestSettings.module.css'
import { Button } from '../../../../base/Buttons/Buttons'
import Editor from '../../../../base/Editor/Editor'

export default function RequestSettings({
  description: initialDescription,
  onSave,
  onClose
}: {
  description: string
  onSave: (description: string) => void
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [description, setDescription] = useState(initialDescription || '')

  const handleSave = () => {
    onSave(description)
    onClose()
  }

  return (
    <div className={styles.settings}>
      <Tabs className="tabs" selectedIndex={activeTab} onSelect={setActiveTab}>
        <TabList>
          <Tab>Request notes</Tab>
        </TabList>

        <div className="tab-panel-wrapper">
          <TabPanel forceRender={true}>
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
