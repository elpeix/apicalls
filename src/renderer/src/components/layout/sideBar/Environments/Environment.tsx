import React, { useContext, useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import EditableName from '../../../base/EditableName/EditableName'
import { AppContext } from '../../../../context/AppContext'
import BulkEntry from '../../../base/BulkEntry/BulkEntry'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Params from '../../../base/Params/Params'

export default function Environment({
  environment,
  back,
  update,
  remove
}: {
  environment: Environment
  back: () => void
  update: (environment: Environment) => void
  remove: (id: Identifier) => void
}) {
  const { application, environments } = useContext(AppContext)
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

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const active = e.target.checked
    if (active) {
      environments?.active(env.id)
    } else {
      environments?.deactive()
    }
  }

  const changeName = (value: string) => {
    setEnv({ ...env, name: value })
    update({ ...env, name: value })
  }

  const addVariable = () => {
    const variables = [...env.variables, { name: '', value: '' }]
    updateVariables(variables)
  }

  const updateVariables = (variables: KeyValue[]) => {
    setEnv({ ...env, variables })
    update({ ...env, variables })
  }

  const handleRemove = () => {
    application.showConfirm({
      message: `Are you sure you want to remove environment ${env.name}?`,
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        remove(env.id)
        application.hidePrompt()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const openBulk = () => {
    application.showDialog({
      children: (
        <BulkEntry
          initialValue={env.variables}
          onSave={(variables) => {
            application.hideDialog()
            updateVariables(variables)
          }}
          onCancel={application.hideDialog}
        />
      ),
      fullWidth: true
    })
  }

  const saveHeaders = (requestHeaders: KeyValue[]) => {
    setEnv({ ...env, requestHeaders })
    update({ ...env, requestHeaders })
  }

  const addHeaderHandler = () => {
    const headers = env.requestHeaders || []
    headers.push({
      name: '',
      value: '',
      enabled: true
    })

    saveHeaders(headers)
  }

  return (
    <div className={`sidePanel-content ${styles.environment}`}>
      <div className={styles.header}>
        <div className={styles.back}>
          <ButtonIcon icon="arrow" direction="west" onClick={back} title="Go back" />
        </div>
        <div className={styles.checkbox}>
          <input
            type="checkbox"
            checked={env.active}
            onClick={(e) => e.stopPropagation()}
            onChange={handleCheckbox}
          />
        </div>
        <EditableName
          name={env.name}
          editMode={editingName}
          className={styles.title}
          editingClassName={styles.editing}
          update={changeName}
          onBlur={() => setEditingName(false)}
          editOnDoubleClick={true}
        />
        <div className={styles.actions}>
          <Menu leftOffset={-93} topOffset={26}>
            <MenuElement icon="edit" onClick={() => setEditingName(true)} title="Rename" />
            <MenuSeparator />
            <MenuElement icon="more" onClick={addVariable} title="Add variable" />
            <MenuElement icon="clipboard" onClick={openBulk} title="Bulk edit" />
            <MenuSeparator />
            <MenuElement
              icon="delete"
              onClick={handleRemove}
              className={styles.remove}
              title="Remove"
            />
          </Menu>
        </div>
      </div>
      <div className={styles.content}>
        {' '}
        <div className={styles.group}>
          <label>Variables</label>
          <Params
            items={env.variables}
            onSave={updateVariables}
            onAdd={addVariable}
            maxNameSize={240}
            minNameSize={60}
            defaultNameSize={90}
            bulkMode={true}
            showEnable={false}
            draggable={true}
            showTip={false}
            dragFormat="EnvironmentVariables"
            addCaption="Add variable"
            removeCaption="Remove variable"
            className={styles.params}
          />
        </div>
        <div className={styles.group}>
          <label>Environment headers</label>
          <Params
            environmentId={env.id}
            items={env.requestHeaders || []}
            onSave={saveHeaders}
            onAdd={addHeaderHandler}
            maxNameSize={240}
            minNameSize={60}
            defaultNameSize={90}
            bulkMode={true}
            draggable={true}
            dragFormat="environment-headers"
            addCaption="Add header"
            removeCaption="Remove header"
            className={styles.params}
          />
        </div>
      </div>
    </div>
  )
}
