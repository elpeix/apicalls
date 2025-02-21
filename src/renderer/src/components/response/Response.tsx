import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import ResponseBody from './ResponseBody'
import ResponseHeaders from './ResponseHeaders'
import { RequestContext } from '../../context/RequestContext'
import Loading from '../base/Loading/Loading'
import styles from './Response.module.css'
import Switch from '../base/Switch/Switch'
import { formatSource, getLanguageName } from '../../lib/languageSupport'

export default function Response() {
  const context = useContext(RequestContext)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [headers, setHeaders] = useState<KeyValue[]>([])

  const [showRaw, setShowRaw] = useState(true)
  const [raw, setRaw] = useState(false)
  const [rawValue, setRawValue] = useState('')
  const [parsedValue, setParsedValue] = useState('')
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setFetching(context.fetching)
    setFetched(context.fetched)
    setFetchError(context.fetchError)
    setHeaders(context.response.headers)
    setRawValue(context.response.body)
    setParsedValue(formatSource(context.response.body))
  }, [context])

  const language: string = useMemo(() => {
    if (raw) return 'text'
    return getLanguageName(rawValue)
  }, [raw, rawValue])

  const handleSelectTab = (index: number) => {
    setTabIndex(index)
    setShowRaw(index === 0)
  }

  const handleCopy = () => {
    let valueToCopy = ''
    if (tabIndex === 0) {
      valueToCopy = raw ? rawValue : parsedValue
    } else {
      valueToCopy = headers
        .map((header) => {
          return `${header.name}: ${header.value}`
        })
        .join('\n')
    }
    navigator.clipboard.writeText(valueToCopy)
  }
  return (
    <>
      {fetching && <Loading />}
      {!fetching && fetched && fetchError.length === 0 && (
        <div className={styles.response}>
          <div className={styles.content}>
            <Tabs className="tabs" onSelect={handleSelectTab} selectedIndex={tabIndex}>
              <div className={styles.tabsList}>
                <TabList>
                  <Tab onMouseDown={() => handleSelectTab(0)}>Response</Tab>
                  <Tab onMouseDown={() => handleSelectTab(1)}>Headers</Tab>
                </TabList>
                <div className={styles.responseActions}>
                  <div className={styles.copy} onClick={handleCopy}>
                    Copy
                  </div>
                  {showRaw && <Switch text="Raw" active={raw} onChange={setRaw} />}
                </div>
              </div>
              <div className="tab-panel-wrapper">
                <TabPanel forceRender={true}>
                  <ResponseBody
                    value={raw ? rawValue : parsedValue}
                    raw={raw}
                    language={language}
                  />
                </TabPanel>
                <TabPanel async forceRender={true}>
                  <ResponseHeaders headers={headers} />
                </TabPanel>
              </div>
            </Tabs>
          </div>
        </div>
      )}
      {!fetching && !fetched && fetchError.length === 0 && (
        <div className={styles.noResponse}>
          <div className={styles.content}>
            <div className={styles.title}>No response</div>
            <div className={styles.message}>Send a request to get a response</div>
          </div>
        </div>
      )}
      {!fetching && fetched && fetchError.length > 0 && (
        <div className={styles.error}>
          <div className={styles.content}>
            <div className={styles.title}>Error</div>
            <div className={styles.message}>{fetchError}</div>
          </div>
        </div>
      )}
    </>
  )
}
