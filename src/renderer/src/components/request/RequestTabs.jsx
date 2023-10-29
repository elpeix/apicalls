import React, { useContext, useEffect, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Params from './Params'
import Headers from './Headers'
import RequestTab from './requestTab/RequestTab'
import Editor from '../base/Editor'

export default function RequestTabs() {

  const context = useContext(RequestContext)
  const [showBody, setShowBody] = useState(false)
  const [activeParams, setActiveParams] = useState(0)
  const [activeHeaders, setActiveHeaders] = useState(0)

  useEffect(() => {
    setShowBody(context.request.method.body)
    setActiveParams(context.request.getActiveParamsLength())
    setActiveHeaders(context.request.getActiveHeadersLength())
  }, [context.request])

  const handleBodyChange = value => context.request.setBody(value)

  return (
    <div className='request-tabs'>
      <Tabs className='tabs'>
        <TabList>
          <Tab>
            <RequestTab name='Params' count={activeParams} />
          </Tab>
          <Tab>
            <RequestTab name='Headers' count={activeHeaders} />
          </Tab>
          <Tab>
            Authorization
          </Tab>
          {showBody && <Tab>Body</Tab> }
        </TabList>
        <div className='tab-panel-wrapper'>
          <TabPanel forceRender={true}>
            <Params />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Headers />
          </TabPanel>
          <TabPanel forceRender={true}>
            Authorization TODO
          </TabPanel>
          { showBody && <TabPanel>
            <Editor
              language='json'
              onChange={handleBodyChange}
              value={context.request.body}
            /> 
          </TabPanel> }
        </div>
      </Tabs>
    </div>
  )
}
