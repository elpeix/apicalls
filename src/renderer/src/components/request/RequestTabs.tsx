import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Params from './Params'
import Headers from './Headers'
import RequestTab from './RequestTab'
import Editor from '../base/Editor'
import styles from './Request.module.css'
import RequestAuth from './RequestAuth'

export default function RequestTabs() {
  const { request } = useContext(RequestContext)

  if (!request) return null

  const showBody = request.method.body
  const activeQueryParams = request.queryParams.getActiveLength()
  const activeHeaders = request.headers.getActiveLength()

  const handleBodyChange = (value: string) => request.setBody(value)

  return (
    <div className={styles.tabs}>
      <Tabs className="tabs">
        <TabList>
          <Tab>
            <RequestTab name="Params" count={activeQueryParams} />
          </Tab>
          <Tab>
            <RequestTab name="Headers" count={activeHeaders} />
          </Tab>
          <Tab>Authorization</Tab>
          {showBody && <Tab>Body</Tab>}
        </TabList>
        <div className="tab-panel-wrapper">
          {request.pathParams && <TabPanel forceRender={true}>pathParams</TabPanel>}
          <TabPanel forceRender={true}>
            <Params
              params={request.queryParams.items}
              setParams={request.queryParams.set}
              addParam={request.queryParams.add}
            />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Headers
              headers={request.headers.items}
              setHeaders={request.headers.set}
              addHeader={request.headers.add}
            />
          </TabPanel>
          <TabPanel forceRender={true}>
            <RequestAuth />
          </TabPanel>
          {showBody && (
            <TabPanel>
              <Editor language="json" onChange={handleBodyChange} value={request.body} />
            </TabPanel>
          )}
        </div>
      </Tabs>
    </div>
  )
}
