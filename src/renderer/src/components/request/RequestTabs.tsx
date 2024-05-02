import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import RequestTab from './RequestTab'
import Editor from '../base/Editor'
import styles from './Request.module.css'
import RequestAuth from './RequestAuth'
import Params from '../base/Params/Params'

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
                items={request.pathParams.items}
                onSave={request.pathParams.set}
                editableName={false}
                showDelete={false}
              />
            </TabPanel>
          )}
          <TabPanel forceRender={true}>
            <Params
              items={request.queryParams.items}
              onSave={request.queryParams.set}
              onAdd={request.queryParams.add}
            />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Params
              items={request.headers.items}
              onSave={request.headers.set}
              onAdd={request.headers.add}
              addCaption="Add header"
              removeCaption="Remove header"
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
