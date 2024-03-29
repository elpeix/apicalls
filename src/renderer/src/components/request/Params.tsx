import React, { useState } from 'react'
import SimpleTable from '../base/SimpleTable/SimpleTable'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Request.module.css'

export default function Params({
  params,
  addParam,
  setParams
}: {
  params: KeyValue[]
  addParam?: () => void
  setParams: (params: KeyValue[]) => void
}) {
  const [nameSize, setNameSize] = useState(200)

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, 500), 100))
  }

  return (
    <div className={styles.params}>
      {params && params.length > 0 && (
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
            {params.map((param: KeyValue, index: number) => (
              <SimpleTable.Row key={index} className={param.enabled ? styles.rowEnabled : ''}>
                <SimpleTable.Cell>
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => {
                      const newParams = [...params]
                      newParams[index].enabled = e.target.checked
                      setParams(newParams)
                    }}
                  />
                </SimpleTable.Cell>
                <SimpleTable.Cell
                  editable
                  autoFocus={param.name === ''}
                  value={param.name}
                  placeholder="Name"
                  onChange={(value) => {
                    const newParams = [...params]
                    newParams[index].name = value
                    setParams(newParams)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell
                  editable
                  value={param.value}
                  placeholder="Value"
                  onChange={(value) => {
                    const newParams = [...params]
                    newParams[index].value = value
                    setParams(newParams)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell>
                  <ButtonIcon
                    icon="delete"
                    onClick={() => {
                      const newParams = [...params]
                      newParams.splice(index, 1)
                      setParams(newParams)
                    }}
                    title="Remove param"
                  />
                </SimpleTable.Cell>
              </SimpleTable.Row>
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      )}
      {addParam && (
        <div className={styles.add}>
          <div>
            <ButtonIcon icon="more" onClick={addParam} title="Add param" />
          </div>
        </div>
      )}
    </div>
  )
}
