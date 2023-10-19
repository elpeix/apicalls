import { Editor } from '@monaco-editor/react'
import React, { useContext, useEffect, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Params from './Params'
import Headers from './Headers'

export default function Request() {

  const context = useContext(RequestContext)
  const [showBody, setShowBody] = useState(false)

  useEffect(() => {
    setShowBody(context.request.method.body)
  }, [context.request.method])

  const handleBodyChange = value => context.request.setBody(value)

  return (
    <div className='request-tabs'>
      <Tabs className='tabs'>
        <TabList>
          <Tab>Params</Tab>
          <Tab>Headers</Tab>
          {showBody && <Tab>Body</Tab> }
        </TabList>
        <div className='tab-panel-wrapper'>
          <TabPanel forceRender={true}>
            <Params />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Headers />
          </TabPanel>
          { showBody && <TabPanel>
            <Editor
              defaultLanguage='json'
              theme='vs-dark'
              onChange={handleBodyChange}
              height="100%"
              width="100%"
              value={context.request.body}
              options={{
                minimap: {
                  enabled: false
                },
                acceptSuggestionOnCommitCharacter: false,
                scrollBeyondLastLine: false,
                codeLens: false,
                contextmenu: false,
                accessibilityHelpUrl: false,
                suggestOnTriggerCharacters: false,
              }}
            /> 
          </TabPanel> }
        </div>
      </Tabs>
    </div>
  )
}
