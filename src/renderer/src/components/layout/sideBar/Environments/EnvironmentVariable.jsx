import React, { useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'

export default function EnvironmentVariable({ variable, id, className, removeVariable, updateVariable }) {

  const [name, setName] = useState(variable.name)
  const [value, setValue] = useState(variable.value)

  const changeName = (e) => {
    setName(e.target.value)
    updateVariable(id, { ...variable, name: e.target.value })
  }

  const changeValue = (e) => {
    setValue(e.target.value)
    updateVariable(id, { ...variable, value: e.target.value })
  }

  return (
    <div className={className}>
      <input value={name} onChange={changeName} />
      <input value={value} onChange={changeValue} />
      <div>
        <ButtonIcon icon='delete' onClick={() => removeVariable(id)} />
      </div>
    </div>
  )
}
