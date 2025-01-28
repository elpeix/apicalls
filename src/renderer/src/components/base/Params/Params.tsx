import React, { useContext, useState } from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import ButtonIcon from '../ButtonIcon'
import styles from './Params.module.css'
import { AppContext } from '../../../context/AppContext'
import BulkEntry from '../BulkEntry/BulkEntry'

export default function Params({
  items,
  onAdd,
  onSave = () => {},
  showEnable = true,
  editableName = true,
  editableValue = true,
  showDelete = true,
  addCaption = 'Add param',
  removeCaption = 'Remove param',
  bulkCaption = 'Bulk entry',
  maxNameSize = 500,
  minNameSize = 100,
  defaultNameSize = 200,
  bulkMode = false
}: {
  items: KeyValue[]
  onAdd?: () => void
  onSave?: (params: KeyValue[]) => void
  editableName?: boolean
  editableValue?: boolean
  showEnable?: boolean
  showDelete?: boolean
  addCaption?: string
  bulkCaption?: string
  removeCaption?: string
  maxNameSize?: number
  minNameSize?: number
  defaultNameSize?: number
  bulkMode?: boolean
}) {
  const { application } = useContext(AppContext)
  const [nameSize, setNameSize] = useState(
    Math.max(Math.min(defaultNameSize, maxNameSize), minNameSize)
  )

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, maxNameSize), minNameSize))
  }

  const enableColumn = showEnable ? '1.9rem' : ''
  const deleteColumn = showDelete ? '2rem' : ''
  const templateColumns = `${enableColumn} ${nameSize}px 1fr ${deleteColumn}`

  const openBulk = () => {
    application.showDialog({
      children: (
        <BulkEntry
          initialValue={items}
          onSave={(items) => {
            application.hideDialog()
            onSave(items)
          }}
          onCancel={application.hideDialog}
        />
      )
    })
  }

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
              <SimpleTable.Row
                key={index}
                className={item.enabled === undefined || item.enabled ? styles.rowEnabled : ''}
              >
                {showEnable && (
                  <SimpleTable.Cell>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[index] = { ...newItems[index], enabled: e.target.checked }
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
                  changeOnKeyUp={true}
                  onChange={(value) => {
                    const newItems = [...items]
                    newItems[index] = { ...newItems[index], name: value }
                    onSave(newItems)
                  }}
                  showTip={true}
                />
                <SimpleTable.Cell
                  editable={editableValue}
                  value={item.value}
                  placeholder="Value"
                  changeOnKeyUp={true}
                  onChange={(value) => {
                    const newItems = [...items]
                    newItems[index] = { ...newItems[index], value }
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
      <div className={styles.footerParams}>
        {onAdd && (
          <div className={styles.add}>
            <div>
              <ButtonIcon icon="more" onClick={onAdd} title={addCaption} />
            </div>
          </div>
        )}
        {bulkMode && (
          <div className={styles.bulk}>
            <div>
              <ButtonIcon icon="clipboard" onClick={openBulk} title={bulkCaption} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
