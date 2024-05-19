import React, { useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import EnvironmentVariables from './EnvironmentVariables'
import EditableName from '../../../base/EditableName/EditableName'

export default function Environment({
  environment,
  back,
  update,
  remove
}: {
  environment: Environment
  back: () => void
  update: (environment: Environment) => void
  remove: () => void
}) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [env, setEnv] = useState(environment)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setEnv(environment)

    if (!environment.name) {
      setEditingName(true)
      setTimeout(() => {
        if (!nameRef.current) return
        nameRef.current.focus()
      }, 0)
    }
  }, [environment])

  const changeName = (value: string) => {
    setEnv({ ...env, name: value })
    update({ ...env, name: value })
  }

  const addVariable = () => {
    const variables = [...env.variables, { name: '', value: '' }]
    updateVariables({ variables })
  }

  const updateVariables = ({ variables }: { variables: KeyValue[] }) => {
    setEnv({ ...env, variables })
    update({ ...env, variables })
  }

  return (
    <div className={`sidePanel-content ${styles.environment}`}>
      <div className={styles.header}>
        <div className={styles.back}>
          <ButtonIcon icon="arrow" direction="west" onClick={back} title="Go back" />
        </div>
        <EditableName
          name={env.name}
          editMode={editingName}
          className={styles.title}
          update={changeName}
          onBlur={() => setEditingName(false)}
          editOnDoubleClick={true}
        />
        <div className={styles.remove}>
          <ButtonIcon icon="delete" onClick={remove} title="Remove environment" />
        </div>
      </div>
      <div className={styles.content}>
        <EnvironmentVariables variables={env.variables} update={updateVariables} />
      </div>
      <div className={styles.footer}>
        <div>
          <ButtonIcon icon="more" onClick={addVariable} title="Add variable" />
        </div>
      </div>
    </div>
  )
}
