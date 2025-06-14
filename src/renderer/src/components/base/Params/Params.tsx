import React, { useContext, useRef, useState } from 'react'
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
  showTip = true,
  addCaption = 'Add param',
  removeCaption = 'Remove param',
  bulkCaption = 'Bulk edit',
  maxNameSize = 500,
  minNameSize = 100,
  defaultNameSize = 200,
  bulkMode = false,
  helperValues = {},
  className = '',
  scrollContainerRef,
  draggable = false,
  dragFormat = 'param'
}: {
  items: KeyValue[]
  onAdd?: () => void
  onSave?: (params: KeyValue[]) => void
  editableName?: boolean
  editableValue?: boolean
  showEnable?: boolean
  showDelete?: boolean
  showTip?: boolean
  addCaption?: string
  bulkCaption?: string
  removeCaption?: string
  maxNameSize?: number
  minNameSize?: number
  defaultNameSize?: number
  bulkMode?: boolean
  helperValues?: { [key: string]: string[] }
  className?: string
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  draggable?: boolean
  dragFormat?: string
}) {
  const { application } = useContext(AppContext)
  const paramsRef = useRef(null)
  const [nameSize, setNameSize] = useState(
    Math.max(Math.min(defaultNameSize, maxNameSize), minNameSize)
  )

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, maxNameSize), minNameSize))
  }

  const showHelperColumn = showEnable || draggable
  const helperColumn = showEnable && draggable ? '2.8rem' : showHelperColumn ? '1.9rem' : ''
  const deleteColumn = showDelete ? '2rem' : ''
  const templateColumns = `${helperColumn} ${nameSize}px 1fr ${deleteColumn}`

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

  const dragHandler = (from: number, to: number) => {
    if (!draggable || from === to) {
      return
    }
    const newItems = [...items]
    const [fromItem] = newItems.splice(from, 1)
    newItems.splice(to, 0, fromItem)
    onSave(newItems)
  }

  return (
    <div className={`${styles.params} ${className}`} ref={paramsRef}>
      {items && items.length > 0 && (
        <SimpleTable templateColumns={templateColumns}>
          <SimpleTable.Header>
            {showHelperColumn && (
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
                showTip={showTip}
                showEnable={showEnable}
                showDelete={showDelete}
                draggable={draggable}
                dragFormat={dragFormat}
                index={index}
                removeCaption={removeCaption}
                onChangeEnabled={(enabled) => changeEnabledHandler(index, enabled)}
                onChangeName={(value) => changeNameHandler(index, value)}
                onChangeValue={(value) => changeValueHandler(index, value)}
                onDelete={() => deleteHandler(index)}
                onDrag={dragHandler}
                scrollContainerRef={scrollContainerRef ? scrollContainerRef : paramsRef}
              />
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      )}
      <div className={styles.footerParams}>
        {bulkMode && (!items || !items.length) && (
          <div className={styles.bulk}>
            <div>
              <ButtonIcon icon="clipboard" onClick={openBulk} title={bulkCaption} />
            </div>
          </div>
        )}
        {onAdd && (
          <div className={styles.add}>
            <div>
              <ButtonIcon icon="more" onClick={onAdd} title={addCaption} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
