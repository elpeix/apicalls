import React, { useContext, useState } from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import ButtonIcon from '../ButtonIcon'
import styles from './Params.module.css'
import { AppContext } from '../../../context/AppContext'
import BulkEntry from '../BulkEntry/BulkEntry'
import ParamLine from './ParamLine'

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
  bulkCaption = 'Bulk edit',
  maxNameSize = 500,
  minNameSize = 100,
  defaultNameSize = 200,
  bulkMode = false,
  helperValues = {}
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
  helperValues?: { [key: string]: string[] }
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
      ),
      fullWidth: true
    })
  }

  const changeEnabledHandler = (index: number, enabled: boolean) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], enabled }
    onSave(newItems)
  }

  const changeNameHandler = (index: number, name: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], name }
    onSave(newItems)
  }
  const changeValueHandler = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], value }
    onSave(newItems)
  }
  const deleteHandler = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onSave(newItems)
  }

  return (
    <div className={styles.params}>
      {items && items.length > 0 && (
        <SimpleTable templateColumns={templateColumns}>
          <SimpleTable.Header>
            {showEnable && (
              <SimpleTable.HeaderCell>
                {bulkMode && (
                  <div>
                    <ButtonIcon icon="clipboard" onClick={openBulk} title={bulkCaption} />
                  </div>
                )}
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
              <ParamLine
                key={index}
                item={item}
                helperValues={helperValues}
                editableName={editableName}
                editableValue={editableValue}
                showEnable={showEnable}
                showDelete={showDelete}
                removeCaption={removeCaption}
                onChangeEnabled={(enabled) => changeEnabledHandler(index, enabled)}
                onChangeName={(value) => changeNameHandler(index, value)}
                onChangeValue={(value) => changeValueHandler(index, value)}
                onDelete={() => deleteHandler(index)}
              />
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
        {bulkMode && (!items || !items.length) && (
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
