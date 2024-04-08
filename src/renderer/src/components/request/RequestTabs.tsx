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

  const handleBodyChange = (value: string | undefined) => {
    if (value === undefined) return
    request.setBody(value)
  }

  return (
    <div className={styles.tabs}>
      <Tabs className="tabs">
        <TabList>
          {request.pathParams.items.length > 0 && (
            <Tab>
              <RequestTab name="Path params" />
            </Tab>
          )}
          <Tab>
            <RequestTab name="Query params" count={activeQueryParams} />
          </Tab>
          <Tab>
            <RequestTab name="Headers" count={activeHeaders} />
          </Tab>
          <Tab>Authorization</Tab>
          {showBody && <Tab>Body</Tab>}
        </TabList>
        <div className="tab-panel-wrapper">
          {request.pathParams.items.length > 0 && (
            <TabPanel forceRender={true}>
              <Params
                params={request.pathParams.items}
                setParams={request.pathParams.set}
                editableName={false}
                showDelete={false}
              />
            </TabPanel>
          )}
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
              <Editor
                language="json"
                onChange={handleBodyChange}
                value={request.body}
                readOnly={false}
              />
            </TabPanel>
          )}
        </div>
      </Tabs>
    </div>
  )
}
