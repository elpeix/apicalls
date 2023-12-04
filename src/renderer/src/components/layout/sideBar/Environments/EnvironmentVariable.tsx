import React, { useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'

export default function EnvironmentVariable({
  variable,
  index,
  className,
  removeVariable,
  updateVariable
}: {
  variable: KeyValue
  index: number
  className: string
  removeVariable: (index: number) => void
  updateVariable: (index: number, variable: KeyValue) => void
}) {
  const [name, setName] = useState(variable.name)
  const [value, setValue] = useState(variable.value)

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    updateVariable(index, { ...variable, name: e.target.value })
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    updateVariable(index, { ...variable, value: e.target.value })
  }

  return (
    <div className={className}>
      <input value={name} onChange={changeName} />
      <input value={value} onChange={changeValue} />
      <div>
        <ButtonIcon icon="delete" onClick={() => removeVariable(index)} />
      </div>
    </div>
  )
}
