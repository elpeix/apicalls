import React, { useContext, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import RequestTab from './RequestTab'
import styles from './Request.module.css'
import RequestAuth from './RequestAuth/RequestAuth'
import Params from '../base/Params/Params'
import Switch from '../base/Switch/Switch'
import HorizontalScroll from '../base/HorizontalScroll/HorizontalScroll'
import { defaultHttpHeaders } from '../../lib/factory'
import RequestBody from './RequestBody'
import ScriptEditor from '../base/Editor/ScriptEditor'

const getTabIndexes = (showPathParams: boolean, showBody: boolean) => {
  let [pathParams, queryParams, headers, auth, preScript, postScript, body] = [0, 1, 2, 3, 4, 5, 6]
  if (!showPathParams) {
    pathParams = -1
    queryParams--
    headers--
    auth--
    preScript--
    postScript--
    body--
  }
  if (!showBody) {
    body = -1
  }
  return { pathParams, queryParams, headers, auth, preScript, postScript, body }
}

export default function RequestTabs() {
  const { request, getRequestEnvironment, tabId } = useContext(RequestContext)

  const getInitialTabIndex = () => {
    if (!tabId) return 0
    const stored = localStorage.getItem(`request_tab_index_${tabId}`)
    return stored ? parseInt(stored) : 0
  }

  const [tabIndex, setTabIndex] = useState(getInitialTabIndex())
  const [wordWrap, setWordWrap] = useState(false)

  if (!request) return null

  const showBody = request.method.body
  const activeQueryParams = request.queryParams.getActiveLength()
  const activeHeaders = request.headers.getActiveLength()

  const tabIndexes = getTabIndexes(request.pathParams.items.length > 0, showBody)

  const handleTabSelect = (index: number) => {
    setTabIndex(index)
    if (tabId) {
      localStorage.setItem(`request_tab_index_${tabId}`, index.toString())
    }
  }

  return (
    <div className={styles.tabs}>
      <Tabs
        className="tabs"
        onSelect={handleTabSelect}
        selectedIndex={tabIndex}
        forceRenderTabPanel={false}
      >
        <div className={styles.tabsList}>
          <HorizontalScroll className={`${styles.requestTabs} panel-tabs-header-list`}>
            <TabList>
              {request.pathParams.items.length > 0 && (
                <Tab onMouseDown={() => handleTabSelect(tabIndexes.pathParams)}>
                  <RequestTab name="Path params" />
                </Tab>
              )}
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.queryParams)}>
                <RequestTab name="Query params" count={activeQueryParams} />
              </Tab>
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.headers)}>
                <RequestTab name="Headers" count={activeHeaders} />
              </Tab>
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.auth)}>Authorization</Tab>
              {showBody && <Tab onMouseDown={() => handleTabSelect(tabIndexes.body)}>Body</Tab>}
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.preScript)}>Pre-Script</Tab>
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.postScript)}>Post-Script</Tab>
            </TabList>
          </HorizontalScroll>
          <div className={styles.requestActions}>
            {(tabIndex === tabIndexes.body ||
              tabIndex === tabIndexes.preScript ||
              tabIndex === tabIndexes.postScript) && (
              <Switch text="Word wrap" active={wordWrap} reverse={true} onChange={setWordWrap} />
            )}
          </div>
        </div>
        <div className="tab-panel-wrapper">
          {request.pathParams.items.length > 0 && (
            <TabPanel>
              <Params
                items={request.pathParams.items}
                onSave={request.pathParams.set}
                editableName={false}
                showDelete={false}
                environmentId={getRequestEnvironment()?.id}
              />
            </TabPanel>
          )}
          <TabPanel>
            <Params
              items={request.queryParams.items}
              onSave={request.queryParams.set}
              onAdd={request.queryParams.add}
              draggable={true}
              environmentId={getRequestEnvironment()?.id}
            />
          </TabPanel>
          <TabPanel>
            <Params
              items={request.headers.items}
              onSave={request.headers.set}
              onAdd={request.headers.add}
              helperValues={defaultHttpHeaders}
              bulkMode={true}
              draggable={true}
              addCaption="Add header"
              removeCaption="Remove header"
              environmentId={getRequestEnvironment()?.id}
            />
          </TabPanel>
          <TabPanel>
            <RequestAuth />
          </TabPanel>
          {showBody && (
            <TabPanel>
              <RequestBody wordWrap={wordWrap} />
            </TabPanel>
          )}
          <TabPanel>
            <ScriptEditor
              script={request.preScript}
              onChange={(val) => request.setPreScript(val)}
              wordWrap={wordWrap}
            />
          </TabPanel>
          <TabPanel>
            <ScriptEditor
              script={request.postScript}
              onChange={(val) => request.setPostScript(val)}
              wordWrap={wordWrap}
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  )
}
