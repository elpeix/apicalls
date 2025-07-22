import React, { useEffect, useState } from 'react'
import styles from './Console.module.css'
import { getStatusName } from '../../../lib/status'
import { stringifySize } from '../../../lib/utils'

export default function Log({ log }: { log: RequestLog }) {
  const [expanded, setExpanded] = useState(false)

  const [requestHeaders, setRequestHeaders] = useState(log.request?.headers || {})
  const [queryParams, setQueryParams] = useState<KeyValue[]>([])
  const [responseHeaders, setResponseHeaders] = useState<KeyValue[]>(
    log.response?.responseHeaders || []
  )

  useEffect(() => {
    setRequestHeaders(log.request?.headers || {})
    const queryParams = (log.request?.queryParams || []).filter((param: KeyValue) => param.enabled)
    setQueryParams(queryParams)
    setResponseHeaders(log.response?.responseHeaders || [])
  }, [log])

  const stringSize = stringifySize(log.response?.contentLength || 0)
  let className = styles.log
  if (log.status === 999) {
    className += ` ${styles.error}`
  }

  return (
    <div className={className}>
      <div
        className={`${styles.header} ${expanded ? styles.expanded : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`${styles.status} ${styles[getStatusName(log.status)]}`}>{log.status}</div>
        <div className={`${styles.method} ${log.method}`}>{log.method}</div>
        <div className={styles.url}>{log.url}</div>
        <div className={styles.time}>{log.time} ms</div>
      </div>
      {expanded && (
        <div className={styles.details}>
          <div className={styles.title}>Request</div>
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.label}>Method</div>
              <div className={styles.value}>{log.method}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>URL</div>
              <div className={styles.value}>{log.request?.url}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>Headers</div>
              <div className={styles.value}>
                {Object.keys(requestHeaders || {}).map((header: string, i: number) => (
                  <div key={`requestHeader_${i}`} className={styles.valueItem}>
                    {header}: {(requestHeaders as { [key: string]: string })[header]}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>Query params</div>
              <div className={styles.value}>
                {queryParams.map((param: KeyValue, i: number) => (
                  <div key={`queryParam_${i}`} className={styles.valueItem}>
                    {param.name}: {param.value}
                  </div>
                ))}
              </div>
            </div>
            {log.request?.method?.body && (
              <div className={styles.row}>
                <div className={styles.label}>Body</div>
                <div className={styles.value}>{log.request?.body}</div>
              </div>
            )}
          </div>
          {!log.failure && (
            <>
              <div className={styles.title}>Response</div>
              <div className={styles.content}>
                <div className={styles.row}>
                  <div className={styles.label}>Status</div>
                  <div className={styles.value}>
                    {log.response?.status.code} {log.response?.status.text}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.label}>Content length</div>
                  <div className={styles.value}>{stringSize}</div>
                </div>
                <div className={styles.row}>
                  <div className={styles.label}>Time</div>
                  <div className={styles.value}>{log.time} ms</div>
                </div>
                <div className={styles.row}>
                  <div className={styles.label}>Headers</div>
                  <div className={styles.value}>
                    {responseHeaders.map((header: KeyValue, i: number) => (
                      <div key={`responseHeader_${i}`} className={styles.valueItem}>
                        {header.name}: {header.value}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.label}>Response</div>
                  <div className={styles.value}>{log.response?.result}</div>
                </div>
              </div>
            </>
          )}

          {log.failure && (
            <>
              <div className={styles.title}>Error</div>
              <div className={styles.content}>
                <div className={styles.row}>
                  <div className={styles.label}>Error</div>
                  <div className={styles.value}>{log.failure.message}</div>
                </div>
                {log.failure.error && (
                  <div className={styles.row}>
                    <div className={styles.label}>Error details</div>
                    <div className={styles.value}>{log.failure.error.stack}</div>
                  </div>
                )}
                {log.failure.cause && (
                  <div className={styles.row}>
                    <div className={styles.label}>Cause</div>
                    <div className={styles.value}>{log.failure.cause}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
