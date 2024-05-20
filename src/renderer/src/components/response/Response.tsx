import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import ResponseBody from './ResponseBody'
import ResponseHeaders from './ResponseHeaders'
import ResponseStatus from './ResponseStatus'
import { RequestContext } from '../../context/RequestContext'
import Loading from '../base/Loading/Loading'
import styles from './Response.module.css'
import Switch from '../base/Switch/Switch'
import { formatSource, getLanguageName } from '../../lib/languageSupport'

export default function Response({
  consoleIsHidden,
  showConsole
}: {
  consoleIsHidden: boolean
  showConsole: () => void
}) {
  const context = useContext(RequestContext)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [status, setStatus] = useState(0)
  const [time, setTime] = useState(0)
  const [size, setSize] = useState(0)
  const [headers, setHeaders] = useState<KeyValue[]>([])
  const [body, setBody] = useState('')

  const [showRaw, setShowRaw] = useState(true)
  const [raw, setRaw] = useState(false)
  const [rawValue, setRawValue] = useState('')
  const [parsedValue, setParsedValue] = useState('')
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setFetching(context.fetching)
    setFetched(context.fetched)
    setStatus(context.response.status)
    setTime(context.response.time)
    setHeaders(context.response.headers)
    setBody(context.response.body)
    setSize(context.response.size)
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
      {!fetching && fetched && (
        <div className={styles.response}>
          <div className={styles.content}>
            <Tabs className="tabs" onSelect={handleSelectTab}>
              <div className={styles.tabsList}>
                <TabList>
                  <Tab>Response</Tab>
                  <Tab>Headers</Tab>
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
          <div className={styles.footer}>
            <ResponseStatus
              status={status}
              time={time}
              size={size}
              consoleIsHidden={consoleIsHidden}
              showConsole={showConsole}
            />
          </div>
        </div>
      )}
      {!fetching && !fetched && (
        <div className={styles.noResponse}>
          <div className={styles.noResponseContent}>
            <div className={styles.noResponseTitle}>No response</div>
            <div className={styles.noResponseMessage}>Send a request to get a response</div>
          </div>
        </div>
      )}
    </>
  )
}
