import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import ResponseBody from './ResponseBody'
import ResponseHeaders from './ResponseHeaders'
import { RequestContext } from '../../context/RequestContext'
import Loading from '../base/Loading/Loading'
import styles from './Response.module.css'
import Switch from '../base/Switch/Switch'
import { formatSource, getLanguageName } from '../../lib/languageSupport'
import { AppContext } from '../../context/AppContext'
import Icon from '../base/Icon/Icon'

export default function Response() {
  const { application } = useContext(AppContext)
  const context = useContext(RequestContext)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState<FetchedType>(false)
  const [fetchError, setFetchError] = useState('')
  const [fetchErrorCause, setFetchErrorCause] = useState('')
  const [headers, setHeaders] = useState<KeyValue[]>([])

  const [showRaw, setShowRaw] = useState(true)
  const [raw, setRaw] = useState(false)
  const [rawValue, setRawValue] = useState('')
  const [wordWrap, setWordWrap] = useState(false)
  const [parsedValue, setParsedValue] = useState('')
  const [tabIndex, setTabIndex] = useState(0)
  const [allowScripts, setAllowScripts] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setFetching(context.fetching)
    setFetched(context.fetched)
    setFetchError(context.fetchError)
    setFetchErrorCause(context.fetchErrorCause)
    setHeaders(context.response.headers)
    setRawValue(context.response.body)
    setParsedValue(formatSource(context.response.body))
  }, [context])

  useEffect(() => {
    if (context.response.body) {
      setBaseUrl(context.request?.url || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.response.body])

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
    application.notify({
      message: 'Response copied to clipboard'
    })
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
                  {language === 'html' && showRaw && (
                    <Switch
                      text="JS"
                      active={allowScripts}
                      reverse={true}
                      onChange={setAllowScripts}
                    />
                  )}
                  {language !== 'html' && showRaw && (
                    <Switch
                      text="Word wrap"
                      active={wordWrap}
                      reverse={true}
                      onChange={setWordWrap}
                    />
                  )}
                  {showRaw && <Switch text="Raw" active={raw} reverse={true} onChange={setRaw} />}
                  <div className={styles.copy} onClick={handleCopy}>
                    <div>
                      <Icon icon="copy" />
                    </div>
                    Copy
                  </div>
                </div>
              </div>
              <div className="tab-panel-wrapper">
                <TabPanel forceRender={true}>
                  <ResponseBody
                    value={raw ? rawValue : parsedValue}
                    raw={raw}
                    wordWrap={wordWrap}
                    language={language}
                    baseUrl={baseUrl}
                    allowScripts={allowScripts}
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
            <div className={styles.message}>
              <span className={styles.errorMessageDetails}>{fetchError}</span>
            </div>
            {fetchErrorCause && (
              <div className={styles.errorCause}>
                <span className={styles.errorMessageDetails}>{fetchErrorCause}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
