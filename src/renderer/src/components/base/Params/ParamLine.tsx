import React, { memo, useCallback } from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import styles from './Params.module.css'
import ButtonIcon from '../ButtonIcon'
import Droppable from '../Droppable/Droppable'
import Icon from '../Icon/Icon'

type ParamLineProps = {
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
  index: number
  onChangeEnabled?: (index: number, enabled: boolean) => void
  onChangeName?: (index: number, value: string) => void
  onChangeValue?: (index: number, value: string) => void
  onDelete?: (index: number) => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  environmentId?: Identifier
}

const ParamLine = memo(function ParamLine({
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
  index,
  onChangeEnabled,
  onChangeName,
  onChangeValue,
  onDelete,
  onDrag,
  scrollContainerRef,
  environmentId
}: ParamLineProps) {
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
    onDrag?.(Number(droppedIndex), index)
  }

  const handleChangeEnabled = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeEnabled?.(index, e.target.checked)
    },
    [index, onChangeEnabled]
  )

  const handleChangeName = useCallback(
    (value: string) => {
      onChangeName?.(index, value)
    },
    [index, onChangeName]
  )

  const handleChangeValue = useCallback(
    (value: string) => {
      onChangeValue?.(index, value)
    },
    [index, onChangeValue]
  )

  const handleDelete = useCallback(() => {
    onDelete?.(index)
  }, [index, onDelete])

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
                onChange={handleChangeEnabled}
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
        onChange={handleChangeName}
        showTip={showTip}
        options={getAvailableNames()}
        scrollContainerRef={scrollContainerRef}
        environmentId={environmentId}
      />
      <SimpleTable.Cell
        editable={editableValue}
        value={item.value}
        placeholder="Value"
        changeOnKeyUp={true}
        onChange={handleChangeValue}
        showTip={showTip}
        options={helperValues[item.name] || []}
        scrollContainerRef={scrollContainerRef}
        environmentId={environmentId}
      />
      {showDelete && (
        <SimpleTable.Cell>
          <ButtonIcon icon="delete" onClick={handleDelete} title={removeCaption} />
        </SimpleTable.Cell>
      )}
    </SimpleTable.Row>
  )
})

export default ParamLine
