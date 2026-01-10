import React, { useContext, useEffect, useRef, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import EditableName from '../../../base/EditableName/EditableName'
import { AppContext } from '../../../../context/AppContext'
import BulkEntry from '../../../base/BulkEntry/BulkEntry'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Params from '../../../base/Params/Params'
import { ENVIRONMENTS } from '../../../../../../lib/ipcChannels'

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
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    if (!environment.name) {
      setTimeout(() => {
        setEditingName(true)
        if (nameRef.current) {
          nameRef.current.focus()
        }
      }, 0)
    }
  }, [environment.name])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ENVIRONMENTS.exportFailure, (_: unknown, { message }: { message: string }) => {
      application.showAlert({ message })
    })
    return () => ipcRenderer?.removeAllListeners(ENVIRONMENTS.exportFailure)
  }, [application])

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const active = e.target.checked
    if (active) {
      environments?.active(environment.id)
    } else {
      environments?.deactive()
    }
  }

  const changeName = (value: string) => {
    update({ ...environment, name: value })
  }

  const addVariable = () => {
    const variables = [...environment.variables, { name: '', value: '' }]
    updateVariables(variables)
  }

  const updateVariables = (variables: KeyValue[]) => {
    update({ ...environment, variables })
  }

  const handleRemove = () => {
    application.showConfirm({
      message: `Are you sure you want to remove environment ${environment.name}?`,
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        remove(environment.id)
        application.hidePrompt()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const openBulk = () => {
    application.showDialog({
      children: (
        <BulkEntry
          initialValue={environment.variables}
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
    update({ ...environment, requestHeaders })
  }

  const addHeaderHandler = () => {
    const headers = environment.requestHeaders || []
    headers.push({
      name: '',
      value: '',
      enabled: true
    })

    saveHeaders(headers)
  }

  const exportEnvironment = () => {
    window.electron?.ipcRenderer.send(ENVIRONMENTS.export, environment.id)
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
            checked={environment.active}
            onClick={(e) => e.stopPropagation()}
            onChange={handleCheckbox}
          />
        </div>
        <EditableName
          name={environment.name}
          editMode={editingName}
          className={styles.title}
          editingClassName={styles.editing}
          update={changeName}
          onBlur={() => setEditingName(false)}
          editOnDoubleClick={true}
        />
        <div className={styles.actions}>
          <Menu leftOffset={-143} topOffset={25}>
            <MenuElement icon="edit" onClick={() => setEditingName(true)} title="Rename" />
            <MenuSeparator />
            <MenuElement icon="more" onClick={addVariable} title="Add variable" />
            <MenuElement icon="clipboard" onClick={openBulk} title="Bulk edit" />
            <MenuSeparator />
            <MenuElement
              icon="save"
              iconDirection="north"
              onClick={exportEnvironment}
              title="Export environment"
            />
            <MenuSeparator />
            <MenuElement
              icon="delete"
              onClick={handleRemove}
              className={styles.remove}
              title="Remove environment"
            />
          </Menu>
        </div>
      </div>
      <div className={styles.content}>
        {' '}
        <div className={styles.group}>
          <label>Variables</label>
          <Params
            items={environment.variables}
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
            environmentId={environment.id}
            items={environment.requestHeaders || []}
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
