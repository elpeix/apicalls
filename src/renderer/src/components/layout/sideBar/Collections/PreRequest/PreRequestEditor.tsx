import React, { useEffect, useRef, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { defaultHttpHeaders, createMethod } from '../../../../../lib/factory'
import Input from '../../../../base/Input/Input'
import MethodSelect from '../../../../base/MethodSelect/MethodSelect'
import styles from './PreRequest.module.css'
import Params from '../../../../base/Params/Params'
import Editor from '../../../../base/Editor/Editor'
import DataToCapture from './DataToCapture'
import Switch from '../../../../base/Switch/Switch'

export default function PreRequestEditor({
  preRequest,
  onSave,
  environmentId
}: {
  preRequest: PreRequest | undefined
  onSave: (data: PreRequest) => void
  environmentId?: Identifier
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'authorization' | 'data'>('authorization')
  const [method, setMethod] = useState<Method>(createMethod('GET'))
  const [headers, setHeaders] = useState<KeyValue[]>([])
  const [queryParams, setQueryParams] = useState<KeyValue[]>([])
  const [body, setBody] = useState<BodyType>('')
  const [dataToCapture, setDataToCapture] = useState<PreRequestDataToCapture[]>([])
  const [active, setActive] = useState(
    preRequest && preRequest.active !== undefined ? preRequest.active : true
  )

  const lastSavedRef = useRef<PreRequest | undefined>(undefined)

  useEffect(() => {
    if (preRequest && preRequest === lastSavedRef.current) return

    setUrl(preRequest?.request.url || '')
    setMethod(preRequest?.request.method || createMethod('GET'))
    setHeaders(preRequest?.request.headers || [])
    setQueryParams(preRequest?.request.queryParams || [])
    setBody(preRequest?.request.body || '')
    setType(preRequest?.type || 'authorization')
    setDataToCapture(preRequest?.dataToCapture || [])
    setActive(preRequest && preRequest.active !== undefined ? preRequest.active : true)
  }, [preRequest])

  useEffect(() => {
    const savedPreRequest = {
      request: {
        method,
        url,
        headers,
        queryParams,
        body
      },
      type,
      dataToCapture,
      active
    }
    lastSavedRef.current = savedPreRequest
    onSave(savedPreRequest)
  }, [method, url, headers, queryParams, body, type, dataToCapture, active])

  const handleBodyChange = (value: string | undefined) => {
    if (value === undefined) return
    setBody(value as BodyType)
  }

  return (
    <div className={styles.preRequest}>
      <div className={styles.bar}>
        <div className={styles.method}>
          <MethodSelect method={method} onSelect={setMethod} />
        </div>
        <Input
          value={url}
          onChange={(v) => setUrl(v)}
          inputRef={inputRef}
          className={styles.url}
          showTip={true}
          placeholder="Enter URL..."
          autoFocus={true}
          environmentId={environmentId}
        />
        <div className={styles.buttons}></div>
      </div>
      <div className={styles.tabs}>
        <Tabs className="tabs">
          <div className={styles.tabsList}>
            <TabList>
              <Tab>Headers</Tab>
              {method.body && <Tab>Body</Tab>}
              <Tab>Data to capture</Tab>
            </TabList>
            <div className={styles.actions}>
              <Switch text="Active" active={active} reverse={true} onChange={setActive} />
            </div>
          </div>
          <div className={`tab-panel-wrapper ${styles.tabsPanels}`}>
            <TabPanel forceRender={true}>
              <Params
                items={headers}
                onSave={setHeaders}
                onAdd={() => setHeaders([...headers, { name: '', value: '', enabled: true }])}
                showEnable={false}
                helperValues={defaultHttpHeaders}
                addCaption="Add header"
                removeCaption="Remove header"
              />
            </TabPanel>
            {method.body && (
              <TabPanel forceRender={true}>
                <div className={styles.editor}>
                  <Editor
                    language="json"
                    onChange={handleBodyChange}
                    value={body as string}
                    readOnly={false}
                    type="none"
                  />
                </div>
              </TabPanel>
            )}
            <TabPanel forceRender={true}>
              <DataToCapture items={dataToCapture} onSave={setDataToCapture} />
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
