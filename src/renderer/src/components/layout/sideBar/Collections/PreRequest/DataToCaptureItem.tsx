import React, { useState } from 'react'
import SimpleTable from '../../../../base/SimpleTable/SimpleTable'
import SimpleSelect from '../../../../base/SimpleSelect/SimpleSelect'
import ButtonIcon from '../../../../base/ButtonIcon'

export default function DataToCaptureItem({
  item,
  onChange,
  onDelete
}: {
  item: PreRequestDataToCapture
  onChange: (item: PreRequestDataToCapture) => void
  onDelete: () => void
}) {
  const [data, setData] = useState(item)

  const handleChange = ({
    type = data.type,
    path = data.path,
    setEnvironmentVariable = data.setEnvironmentVariable
  }: Partial<PreRequestDataToCapture>) => {
    const newData = { id: item.id, type, path, setEnvironmentVariable } as PreRequestDataToCapture
    setData(newData)
    onChange(newData)
  }

  return (
    <SimpleTable.Row>
      <SimpleTable.Cell>
        <SimpleSelect
          value={data.type}
          options={[
            { label: 'Body', value: 'body' },
            { label: 'Header', value: 'header' }
          ]}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'body' || value === 'header') {
              handleChange({ type: value })
            }
          }}
          autoFocus
        />
      </SimpleTable.Cell>
      <SimpleTable.Cell
        editable={true}
        value={data.path}
        placeholder="Enter path"
        onChange={(value) => {
          handleChange({ path: value })
        }}
      ></SimpleTable.Cell>
      <SimpleTable.Cell
        editable={true}
        value={data.setEnvironmentVariable}
        placeholder="Set environment variable"
        onChange={(value) => {
          handleChange({ setEnvironmentVariable: value })
        }}
      ></SimpleTable.Cell>
      <SimpleTable.Cell>
        <ButtonIcon icon="delete" onClick={onDelete} />
      </SimpleTable.Cell>
    </SimpleTable.Row>
  )
}
