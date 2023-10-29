import React, { useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import EnvironmentVariable from './EnvironmentVariable'

export default function Environment({ environment, back, update, remove }) {

  const nameRef = useRef(null)
  const [name, setName] = useState(environment.name)
  const [variables, setVariables] = useState(environment.variables)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    if (!environment.name) {
      setEditingName(true)
      setTimeout(() => nameRef.current.focus(), 0)
    }
  }, [environment.name])

  const editName = () => {
    setEditingName(true)
    setTimeout(() => {
      nameRef.current.setSelectionRange(0, name.length)
      nameRef.current.focus()      
    }, 0)
  }
  const changeName = (e) => {
    setName(e.target.value)
    update({ ...environment, name: e.target.value })
  }
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setEditingName(false)
    }
    if (e.key === 'Enter') {
      setEditingName(false)
    }
  }

  const addVariable = () => {
    const newVariables = [...variables, { name: '', value: '' }]
    updateVariables({ variables: newVariables })
  }
  const removeVariable = (index) => {
    const newVariables = [...variables]
    newVariables.splice(index, 1)
    updateVariables({ variables: newVariables })
  }
  const updateVariable = (index, variable) => {
    const newVariables = [...variables]
    newVariables[index] = { ...newVariables[index], ...variable }
    updateVariables({ variables: newVariables })
  }

  const updateVariables = ({ variables }) => {
    setVariables(variables)
    update({ ...environment, variables })
  }

  return (
    <div className={`sidePanel-content ${styles.environment}`}>
      <div className={styles.header}>
        <div className={styles.back}>
          <ButtonIcon icon='back' onClick={back} />
        </div>
        <div className={styles.title} onClick={editName}>
          {editingName && (
            <input
              ref={nameRef}
              className={styles.nameInput}
              placeholder='Environment name'
              value={name}
              onChange={changeName}
              onBlur={() => setEditingName(false)}
              onKeyDown={onKeyDown}
            />
          )}
          {!editingName && (name)}
        </div>
        <div className={styles.remove}>
          <ButtonIcon icon='delete' onClick={remove} />
        </div>
      </div>
      <div className={styles.content}>
        {variables.map((variable, index) => (
          <EnvironmentVariable
            key={index}
            variable={variable}
            id={index}
            className={styles.variable}
            removeVariable={removeVariable}
            updateVariable={updateVariable}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <div>
          <ButtonIcon icon='more' onClick={addVariable} />
        </div>
      </div>
    </div>
  )
}
