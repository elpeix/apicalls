import React, { useState } from 'react'
import { useRequestData, useRequestActions, useRequestMeta } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import RequestTab from './RequestTab'
import styles from './Request.module.css'
import RequestAuth from './RequestAuth/RequestAuth'
import Params from '../base/Params/Params'
import Switch from '../base/Switch/Switch'
import HorizontalScroll from '../base/HorizontalScroll/HorizontalScroll'
import { defaultHttpHeaders } from '../../lib/factory'
import RequestBody from './RequestBody'
import RequestScript from './RequestScript'

const getTabIndexes = (showPathParams: boolean, showBody: boolean) => {
  let [pathParams, queryParams, headers, auth, body, scripts] = [0, 1, 2, 3, 4, 5]
  if (!showPathParams) {
    pathParams = -1
    queryParams--
    headers--
    auth--
    body--
    scripts--
  }
  if (!showBody) {
    body = -1
    scripts--
  }
  return { pathParams, queryParams, headers, auth, body, scripts }
}

export default function RequestTabs() {
  const { method, headers, queryParams, pathParams } = useRequestData()
  const {
    headers: headersActions,
    queryParams: queryParamsActions,
    pathParams: pathParamsActions
  } = useRequestActions()
  const { getRequestEnvironment, tabId } = useRequestMeta()

  const getInitialTabIndex = () => {
    if (!tabId) return 0
    const stored = localStorage.getItem(`request_tab_index_${tabId}`)
    return stored ? parseInt(stored) : 0
  }

  const [tabIndex, setTabIndex] = useState(getInitialTabIndex())
  const [wordWrap, setWordWrap] = useState(false)

  const showBody = method.body
  const activeQueryParams = queryParamsActions.getActiveLength()
  const activeHeaders = headersActions.getActiveLength()

  const tabIndexes = getTabIndexes(pathParams.length > 0, showBody)

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
              {pathParams.length > 0 && (
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
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.scripts)}>Scripts</Tab>
            </TabList>
          </HorizontalScroll>
          <div className={styles.requestActions}>
            {(tabIndex === tabIndexes.body || tabIndex === tabIndexes.scripts) && (
              <Switch text="Word wrap" active={wordWrap} reverse={true} onChange={setWordWrap} />
            )}
          </div>
        </div>
        <div className="tab-panel-wrapper">
          {pathParams.length > 0 && (
            <TabPanel>
              <Params
                items={pathParams}
                onSave={pathParamsActions.set}
                editableName={false}
                showDelete={false}
                environmentId={getRequestEnvironment()?.id}
              />
            </TabPanel>
          )}
          <TabPanel>
            <Params
              items={queryParams}
              onSave={queryParamsActions.set}
              onAdd={queryParamsActions.add}
              draggable={true}
              environmentId={getRequestEnvironment()?.id}
            />
          </TabPanel>
          <TabPanel>
            <Params
              items={headers}
              onSave={headersActions.set}
              onAdd={headersActions.add}
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
            <RequestScript wordWrap={wordWrap} />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  )
}
