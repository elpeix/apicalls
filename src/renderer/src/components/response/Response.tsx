import React, { useContext, useEffect, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import ResponseBody from './ResponseBody'
import ResponseHeaders from './ResponseHeaders'
import ResponseStatus from './ResponseStatus'
import { RequestContext } from '../../context/RequestContext'
import Loading from '../base/Loading/Loading'
import styles from './Response.module.css'

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

  useEffect(() => {
    setFetching(context.fetching)
    setFetched(context.fetched)
    setStatus(context.response.status)
    setTime(context.response.time)
    setHeaders(context.response.headers)
    setBody(context.response.body)
    setSize(context.response.size)
  }, [context])

  return (
    <>
      {fetching && <Loading />}
      {!fetching && fetched && (
        <div className={styles.response}>
          <div className={styles.content}>
            <Tabs className="tabs">
              <TabList>
                <Tab>Response</Tab>
                <Tab>Headers</Tab>
              </TabList>
              <div className="tab-panel-wrapper">
                <TabPanel forceRender={true}>
                  <ResponseBody value={body} />
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
