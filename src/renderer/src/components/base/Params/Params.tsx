import React, { useState } from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import ButtonIcon from '../ButtonIcon'
import styles from './Params.module.css'

export default function Params({
  items,
  onAdd,
  onSave,
  showEnable = true,
  editableName = true,
  showDelete = true,
  addCaption = 'Add param',
  removeCaption = 'Remove param'
}: {
  items: KeyValue[]
  onAdd?: () => void
  onSave: (params: KeyValue[]) => void
  editableName?: boolean
  showEnable?: boolean
  showDelete?: boolean
  addCaption?: string
  removeCaption?: string
}) {
  const [nameSize, setNameSize] = useState(200)

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, 500), 100))
  }

  const enableColumn = showEnable ? '1.9rem' : ''
  const deleteColumn = showDelete ? '2rem' : ''
  const templateColumns = `${enableColumn} ${nameSize}px 1fr ${deleteColumn}`

  return (
    <div className={styles.params}>
      {items && items.length > 0 && (
        <SimpleTable templateColumns={templateColumns}>
          <SimpleTable.Header>
            {showEnable && (
              <SimpleTable.HeaderCell>
                <></>
              </SimpleTable.HeaderCell>
            )}
            <SimpleTable.HeaderCell draggable={true} onDrag={changeNameSize}>
              Name
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            {showDelete && (
              <SimpleTable.HeaderCell>
                <></>
              </SimpleTable.HeaderCell>
            )}
          </SimpleTable.Header>
          <SimpleTable.Body>
            {items.map((item: KeyValue, index: number) => (
              <SimpleTable.Row key={index} className={item.enabled ? styles.rowEnabled : ''}>
                {showEnable && (
                  <SimpleTable.Cell>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[index].enabled = e.target.checked
                        onSave(newItems)
                      }}
                    />
                  </SimpleTable.Cell>
                )}
                <SimpleTable.Cell
                  editable={editableName}
                  autoFocus={item.name === ''}
                  value={item.name}
                  placeholder="Name"
                  onChange={(value) => {
                    const newItems = [...items]
                    newItems[index].name = value
                    onSave(newItems)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell
                  editable
                  value={item.value}
                  placeholder="Value"
                  onChange={(value) => {
                    const newItems = [...items]
                    newItems[index].value = value
                    onSave(newItems)
                  }}
                  showTip={true}
                />
                {showDelete && (
                  <SimpleTable.Cell>
                    <ButtonIcon
                      icon="delete"
                      onClick={() => {
                        const nesItems = [...items]
                        nesItems.splice(index, 1)
                        onSave(nesItems)
                      }}
                      title={removeCaption}
                    />
                  </SimpleTable.Cell>
                )}
              </SimpleTable.Row>
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      )}
      {onAdd && (
        <div className={styles.add}>
          <div>
            <ButtonIcon icon="more" onClick={onAdd} title={addCaption} />
          </div>
        </div>
      )}
    </div>
  )
}
