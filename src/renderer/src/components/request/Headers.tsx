import React, { useState } from 'react'
import SimpleTable from '../base/SimpleTable/SimpleTable'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Request.module.css'

export default function Headers({
  headers,
  setHeaders,
  addHeader
}: {
  headers: KeyValue[]
  setHeaders: (params: KeyValue[]) => void
  addHeader?: () => void
}) {
  const [nameSize, setNameSize] = useState(200)

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, 500), 100))
  }

  return (
    <div className={styles.headers}>
      {headers && headers.length > 0 && (
        <SimpleTable templateColumns={`1.9rem ${nameSize}px 1fr 2rem`}>
          <SimpleTable.Header>
            <SimpleTable.HeaderCell>
              <></>
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell draggable={true} onDrag={changeNameSize}>
              Name
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>
              <></>
            </SimpleTable.HeaderCell>
          </SimpleTable.Header>
          <SimpleTable.Body>
            {headers.map((header: KeyValue, index: number) => (
              <SimpleTable.Row key={index} className={header.enabled ? styles.rowEnabled : ''}>
                <SimpleTable.Cell>
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => {
                      const newHeaders = [...headers]
                      newHeaders[index].enabled = e.target.checked
                      setHeaders(newHeaders)
                    }}
                  />
                </SimpleTable.Cell>
                <SimpleTable.Cell
                  editable
                  autoFocus={header.name === ''}
                  value={header.name}
                  placeholder="Name"
                  onChange={(value) => {
                    const newHeaders = [...headers]
                    newHeaders[index].name = value
                    setHeaders(newHeaders)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell
                  editable
                  value={header.value}
                  placeholder="Value"
                  onChange={(value) => {
                    const newHeaders = [...headers]
                    newHeaders[index].value = value
                    setHeaders(newHeaders)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell
                  value={
                    <ButtonIcon
                      icon="delete"
                      onClick={() => {
                        const newHeaders = [...headers]
                        newHeaders.splice(index, 1)
                        setHeaders(newHeaders)
                      }}
                      title="Remove header"
                    />
                  }
                />
              </SimpleTable.Row>
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      )}
      <div className={styles.add}>
        <div>
          <ButtonIcon icon="more" onClick={addHeader} title="Add header" />
        </div>
      </div>
    </div>
  )
}
