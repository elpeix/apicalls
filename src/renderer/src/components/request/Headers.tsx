import React from 'react'
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
  addHeader: () => void
}) {
  return (
    <div className={styles.headers}>
      {headers && headers.length > 0 && (
        <SimpleTable templateColumns="30px 1fr 1fr 40px">
          <SimpleTable.Header>
            <SimpleTable.HeaderCell>
              <></>
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Name</SimpleTable.HeaderCell>
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
