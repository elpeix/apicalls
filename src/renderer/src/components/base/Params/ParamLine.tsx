import React from 'react'
import SimpleTable from '../SimpleTable/SimpleTable'
import styles from './Params.module.css'
import ButtonIcon from '../ButtonIcon'

export default function ParamLine({
  item,
  editableName = true,
  editableValue = true,
  showEnable = true,
  showDelete = true,
  removeCaption = 'Remove param',
  helperValues = {},
  onChangeEnabled = () => {},
  onChangeName = () => {},
  onChangeValue = () => {},
  onDelete = () => {}
}: {
  item: KeyValue
  editableName?: boolean
  editableValue?: boolean
  showEnable?: boolean
  showDelete?: boolean
  removeCaption?: string
  helperValues?: { [key: string]: string[] }
  onChangeEnabled?: (enabled: boolean) => void
  onChangeName?: (value: string) => void
  onChangeValue?: (value: string) => void
  onDelete?: () => void
}) {
  const getAvialableNames = () => {
    return Object.keys(helperValues)
  }

  return (
    <SimpleTable.Row
      className={item.enabled === undefined || item.enabled ? styles.rowEnabled : ''}
    >
      {showEnable && (
        <SimpleTable.Cell>
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => onChangeEnabled(e.target.checked)}
          />
        </SimpleTable.Cell>
      )}
      <SimpleTable.Cell
        editable={editableName}
        autoFocus={item.name === ''}
        value={item.name}
        placeholder="Name"
        changeOnKeyUp={true}
        onChange={onChangeName}
        showTip={true}
        options={getAvialableNames()}
      />
      <SimpleTable.Cell
        editable={editableValue}
        value={item.value}
        placeholder="Value"
        changeOnKeyUp={true}
        onChange={onChangeValue}
        showTip={true}
        options={helperValues[item.name] || []}
      />
      {showDelete && (
        <SimpleTable.Cell>
          <ButtonIcon icon="delete" onClick={onDelete} title={removeCaption} />
        </SimpleTable.Cell>
      )}
    </SimpleTable.Row>
  )
}
