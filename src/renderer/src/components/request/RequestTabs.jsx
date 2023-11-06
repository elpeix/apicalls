import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Params from './Params'
import Headers from './Headers'
import RequestTab from './RequestTab'
import Editor from '../base/Editor'
import styles from './Request.module.css'

export default function RequestTabs() {

  const { request } = useContext(RequestContext)
  const showBody = request.method.body
  const activeParams = request.getActiveParamsLength()
  const activeHeaders = request.getActiveHeadersLength()

  const handleBodyChange = value => request.setBody(value)

  return (
    <div className={styles.tabs}>
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
            <Params params={request.params} setParams={request.setParams} addParam={request.addParam} />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Headers headers={request.headers} setHeaders={request.setHeaders} addHeader={request.addHeader} />
          </TabPanel>
          <TabPanel forceRender={true}>
            Authorization TODO
          </TabPanel>
          { showBody && <TabPanel>
            <Editor
              language='json'
              onChange={handleBodyChange}
              value={request.body}
            /> 
          </TabPanel> }
        </div>
      </Tabs>
    </div>
  )
}
