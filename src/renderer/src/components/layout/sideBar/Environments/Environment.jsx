import React, { useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import EnvironmentVariable from './EnvironmentVariable'

export default function Environment({ environment, back, update, remove }) {

  const nameRef = useRef(null)
  const [env, setEnv] = useState(environment)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setEnv(environment)

    if (!environment.name) {
      setEditingName(true)
      setTimeout(() => nameRef.current.focus(), 0)
    }
  }, [environment])

  const editName = () => {
    setEditingName(true)
    setTimeout(() => {
      nameRef.current.setSelectionRange(0, env.name.length)
      nameRef.current.focus()
    }, 0)
  }
  const changeName = (e) => {
    setEnv({ ...env, name: e.target.value })
    update({ ...env, name: e.target.value })
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
    const variables = [...env.variables, { name: '', value: '' }]
    updateVariables({ variables })
  }
  const removeVariable = (index) => {
    const variables = [...env.variables]
    variables.splice(index, 1)
    updateVariables({ variables })
  }
  const updateVariable = (index, variable) => {
    const variables = [...env.variables]
    variables[index] = { ...variables[index], ...variable }
    updateVariables({ variables })
  }

  const updateVariables = ({ variables }) => {
    setEnv({ ...env, variables })
    update({ ...env, variables })
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
              value={env.name}
              onChange={changeName}
              onBlur={() => setEditingName(false)}
              onKeyDown={onKeyDown}
            />
          )}
          {!editingName && (env.name)}
        </div>
        <div className={styles.remove}>
          <ButtonIcon icon='delete' onClick={remove} />
        </div>
      </div>
      <div className={styles.content}>
        {env.variables.map((variable, index) => (
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
