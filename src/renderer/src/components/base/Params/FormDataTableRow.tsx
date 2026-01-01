import { DIALOG } from '../../../../../lib/ipcChannels'
import React from 'react'
import SimpleTable from '../SimpleTable/SimpleTable' // Correct relative path from components/request/ to components/base/ is ../base/
import styles from './Params.module.css'
import ButtonIcon from '../ButtonIcon'
import Droppable from '../Droppable/Droppable'
import Icon from '../Icon/Icon'
import SimpleSelect from '../SimpleSelect/SimpleSelect'

export default function FormDataTableRow({
  item,
  editableName = true,
  editableValue = true,
  showEnable = true,
  showDelete = true,
  removeCaption = 'Remove param',
  showTip = true,
  helperValues = {},
  draggable = false,
  dragFormat = '',
  index = -1,
  onChangeEnabled = () => {},
  onChangeName = () => {},
  onChangeValue = () => {},
  onChangeType = () => {},
  onDelete = () => {},
  onDrag = () => {},
  scrollContainerRef,
  environmentId,
  showType = true
}: {
  item: KeyValue
  editableName?: boolean
  editableValue?: boolean
  showEnable?: boolean
  showDelete?: boolean
  removeCaption?: string
  showTip?: boolean
  helperValues?: { [key: string]: string[] }
  draggable?: boolean
  dragFormat?: string
  onDrag?: (from: number, to: number) => void
  index?: number
  onChangeEnabled?: (enabled: boolean) => void
  onChangeName?: (value: string) => void
  onChangeType?: (value: 'text' | 'file') => void
  onChangeValue?: (value: string) => void
  onDelete?: () => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  environmentId?: Identifier
  showType?: boolean
}) {
  const getAvailableNames = () => {
    return Object.keys(helperValues)
  }
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData(dragFormat, index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const droppedIndex = e.dataTransfer.getData(dragFormat)
    onDrag(Number(droppedIndex), index)
  }

  const showHelperColumn = showEnable || draggable
  const allowFiles = showType

  const handleFileChoice = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(DIALOG.open)
      if (!result.canceled && result.filePaths.length > 0) {
        onChangeValue(result.filePaths[0])
      }
    } catch (e) {
      console.error('Failed to open dialog', e)
    }
  }

  const simplePath = (path: string) => {
    const parts = path.split('/').filter((p) => p !== '')
    return parts[parts.length - 1]
  }

  return (
    <SimpleTable.Row
      className={item.enabled === undefined || item.enabled ? styles.rowEnabled : ''}
    >
      {/* ... helper column ... */}
      {showHelperColumn && (
        <SimpleTable.Cell>
          <>
            {draggable && (
              <Droppable
                draggable={draggable}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                dragDecorator="left"
                allowedDropTypes={[dragFormat]}
                className={`${styles.draggable}`}
              >
                <Icon icon="drag" />
              </Droppable>
            )}
            {showEnable && (
              <input
                type="checkbox"
                checked={item.enabled}
                className={styles.checkbox}
                onChange={(e) => onChangeEnabled(e.target.checked)}
              />
            )}
          </>
        </SimpleTable.Cell>
      )}
      <SimpleTable.Cell
        editable={editableName}
        autoFocus={item.name === ''}
        value={item.name}
        placeholder="Name"
        changeOnKeyUp={true}
        onChange={onChangeName}
        showTip={showTip}
        options={getAvailableNames()}
        scrollContainerRef={scrollContainerRef}
        environmentId={environmentId}
      />

      {/* Type Selector */}
      {showType && (
        <SimpleTable.Cell className={styles.selectCell}>
          <SimpleSelect
            className={styles.select}
            value={item.type || 'text'}
            onChange={(e) => onChangeType(e.target.value as 'text' | 'file')}
            options={[
              { value: 'text', label: 'Text' },
              { value: 'file', label: 'File' }
            ]}
          />
        </SimpleTable.Cell>
      )}

      {/* Value Input */}
      {item.type === 'file' && allowFiles ? (
        <SimpleTable.Cell className={styles.fileCell}>
          <div className={styles.fileCellContent} onClick={handleFileChoice}>
            <input type="text" value={item.value} readOnly placeholder="Select a file" />
            <ButtonIcon className={styles.fileButton} icon="file" title="Select file" />
            <div
              className={`${styles.fileValue} ${item.value === '' ? styles.empty : ''}`}
              title={item.value}
            >
              {item.value === '' ? 'No file selected' : simplePath(item.value)}
            </div>
          </div>
        </SimpleTable.Cell>
      ) : (
        <SimpleTable.Cell
          editable={editableValue}
          value={item.value}
          placeholder="Value"
          changeOnKeyUp={true}
          onChange={onChangeValue}
          showTip={showTip}
          options={helperValues[item.name] || []}
          scrollContainerRef={scrollContainerRef}
          environmentId={environmentId}
        />
      )}

      {showDelete && (
        <SimpleTable.Cell>
          <ButtonIcon icon="delete" onClick={onDelete} title={removeCaption} />
        </SimpleTable.Cell>
      )}
    </SimpleTable.Row>
  )
}
