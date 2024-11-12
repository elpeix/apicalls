import React, { useEffect, useRef, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { createMethod } from '../../../../../lib/factory'
import Input from '../../../../base/Input/Input'
import MethodSelect from '../../../../base/MethodSelect/MethodSelect'
import styles from './PreRequest.module.css'
import Params from '../../../../base/Params/Params'
import Editor from '../../../../base/Editor'
import DataToCapture from './DataToCapture'

export default function PreRequestEditor({
  preRequest,
  onSave,
  onClose
}: {
  preRequest: PreRequest | undefined
  onSave: (data: PreRequest) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'authorization' | 'data'>('authorization')
  const [method, setMethod] = useState<Method>(createMethod('GET'))
  const [headers, setHeaders] = useState<KeyValue[]>([])
  const [queryParams, setQueryParams] = useState<KeyValue[]>([])
  const [body, setBody] = useState<string>('')
  const [dataToCapture, setDataToCapture] = useState<PreRequestDataToCapture[]>([])
  const [active, setActive] = useState(
    preRequest && preRequest.active !== undefined ? preRequest.active : true
  )

  useEffect(() => {
    setUrl(preRequest?.request.url || '')
    setMethod(preRequest?.request.method || createMethod('GET'))
    setHeaders(preRequest?.request.headers || [])
    setQueryParams(preRequest?.request.queryParams || [])
    setBody(preRequest?.request.body || '')
    setType(preRequest?.type || 'authorization')
    setDataToCapture(preRequest?.dataToCapture || [])
    setActive(preRequest && preRequest.active !== undefined ? preRequest.active : true)
  }, [preRequest])

  const handleSave = () => {
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
    onSave(savedPreRequest)
    onClose()
  }

  const handleBodyChange = (value: string | undefined) => {
    if (value === undefined) return
    setBody(value)
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
        />
        <div className={styles.buttons}></div>
      </div>
      <div className={styles.tabs}>
        <Tabs className="tabs">
          <TabList>
            <Tab>Headers</Tab>
            {method.body && <Tab>Body</Tab>}
            <Tab>Data to capture</Tab>
          </TabList>
          <div className={`tab-panel-wrapper ${styles.tabsPanels}`}>
            <TabPanel forceRender={true}>
              <Params
                items={headers}
                onSave={setHeaders}
                onAdd={() => setHeaders([...headers, { name: '', value: '', enabled: true }])}
                showEnable={false}
                addCaption="Add header"
                removeCaption="Remove header"
              />
            </TabPanel>
            {method.body && (
              <TabPanel forceRender={true}>
                <Editor language="json" onChange={handleBodyChange} value={body} readOnly={false} />
              </TabPanel>
            )}
            <TabPanel forceRender={true}>
              <DataToCapture items={dataToCapture} onSave={setDataToCapture} />
            </TabPanel>
          </div>
        </Tabs>
      </div>
      <div className={styles.footer}>
        <div className={styles.left}>
          <label>
            <input type="checkbox" checked={active} onChange={() => setActive(!active)} />
            <span className={active ? styles.active : ''}>Active</span>
          </label>
        </div>
        <div className={styles.right}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.save} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
