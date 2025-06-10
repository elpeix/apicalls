import React from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import styles from './Params.module.css'
import ButtonIcon from '../ButtonIcon'
import Droppable from '../Droppable/Droppable'
import Icon from '../Icon/Icon'

export default function ParamLine({
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
  onDelete = () => {},
  onDrag = () => {},
  scrollContainerRef
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
  onChangeValue?: (value: string) => void
  onDelete?: () => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
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

  return (
    <SimpleTable.Row
      className={item.enabled === undefined || item.enabled ? styles.rowEnabled : ''}
    >
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
      />
      <SimpleTable.Cell
        editable={editableValue}
        value={item.value}
        placeholder="Value"
        changeOnKeyUp={true}
        onChange={onChangeValue}
        showTip={showTip}
        options={helperValues[item.name] || []}
        scrollContainerRef={scrollContainerRef}
      />
      {showDelete && (
        <SimpleTable.Cell>
          <ButtonIcon icon="delete" onClick={onDelete} title={removeCaption} />
        </SimpleTable.Cell>
      )}
    </SimpleTable.Row>
  )
}
