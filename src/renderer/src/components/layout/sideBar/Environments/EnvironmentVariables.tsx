import React, { useState } from 'react'
import SimpleTable from '../../../base/SimpleTable/SimpleTable'
import styles from './Environment.module.css'
import ButtonIcon from '../../../base/ButtonIcon'

export default function EnvironmentVariables({
  variables,
  update
}: {
  variables: KeyValue[]
  update: ({ variables }: { variables: KeyValue[] }) => void
}) {
  const [nameSize, setNameSize] = useState(120)

  const changeNameSize = (offset: number) => {
    const newSize = nameSize + offset
    setNameSize(Math.max(Math.min(newSize, 300), 80))
  }

  const updateVariable = (index: number, variable: KeyValue) => {
    const newVariables = [...variables]
    newVariables[index] = variable
    update({ variables: newVariables })
  }

  const removeVariable = (index: number) => {
    const newVariables = [...variables]
    newVariables.splice(index, 1)
    update({ variables: newVariables })
  }

  return (
    <SimpleTable templateColumns={`${nameSize}px 1fr 2rem`}>
      <SimpleTable.Header>
        <SimpleTable.HeaderCell draggable={true} onDrag={changeNameSize}>
          Name
        </SimpleTable.HeaderCell>
        <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
        <SimpleTable.HeaderCell>
          <></>
        </SimpleTable.HeaderCell>
      </SimpleTable.Header>
      <SimpleTable.Body>
        {variables.map((variable, index) => (
          <SimpleTable.Row key={index} className={styles.rowEnabled}>
            <SimpleTable.Cell
              editable
              autoFocus={variable.name === ''}
              value={variable.name}
              placeholder="Name"
              onChange={(value) => updateVariable(index, { name: value, value: variable.value })}
            />
            <SimpleTable.Cell
              editable
              value={variable.value}
              placeholder="Value"
              onChange={(value) => {
                updateVariable(index, { name: variable.name, value: value })
              }}
            />
            <SimpleTable.Cell
              value={
                <ButtonIcon
                  icon="delete"
                  onClick={() => removeVariable(index)}
                  title="Remove header"
                />
              }
            />
          </SimpleTable.Row>
        ))}
      </SimpleTable.Body>
    </SimpleTable>
  )
}
