import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ENVIRONMENTS, WORKSPACES } from '../../../../../../lib/ipcChannels'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Environment from './Environment'
import EnvironmentItem from './EnvironmentItem'
import styles from './Environment.module.css'
import { FilterInput } from '../../../base/FilterInput/FilterInput'
import Scrollable from '../../../base/Scrollable'
import Icon from '../../../base/Icon/Icon'

export default function Environments() {
  const { application, environments } = useContext(AppContext)
  const { showAlert } = application

  const envs = environments?.getAll() || []
  const [selectedEnvId, setSelectedEnvId] = useState<Identifier | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')
  const [isScrolling, setIsScrolling] = useState(false)

  const selectedEnvironment = useMemo(() => {
    return selectedEnvId && environments ? environments.get(selectedEnvId) : null
  }, [environments, selectedEnvId])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    const handleImportFailure = (_: unknown, message: string) => {
      showAlert({ message })
    }
    const handleWorkspaceChanged = () => {
      setSelectedEnvId(null)
    }
    ipcRenderer?.on(ENVIRONMENTS.importFailure, handleImportFailure)
    ipcRenderer?.on(WORKSPACES.changed, handleWorkspaceChanged)
    return () => {
      ipcRenderer?.removeListener(ENVIRONMENTS.importFailure, handleImportFailure)
      ipcRenderer?.removeListener(WORKSPACES.changed, handleWorkspaceChanged)
    }
  }, [showAlert])

  const setSelectedEnvironment = (env: Environment | null) => {
    setSelectedEnvId(env ? env.id : null)
  }

  const add = () => {
    if (!environments) return
    application.showPrompt({
      message: 'Enter a name for the new environment:',
      placeholder: 'Environment name',
      onConfirm(name: string) {
        const environment = environments.create(name)
        setSelectedEnvId(environment.id)
        application.hidePrompt()
      },
      onCancel() {
        application.hidePrompt()
      }
    })
  }

  const update = (environment: Environment) => {
    if (!environments) return
    environments.update(environment)
  }

  const remove = (id: Identifier) => {
    if (!environments) return
    if (id) {
      environments.remove(id)
      if (selectedEnvId && selectedEnvId === id) {
        setSelectedEnvId(null)
      }
    }
  }

  const duplicate = (id: Identifier) => {
    if (!environments) return
    environments.duplicate(id)
  }

  const handleShowFilter = () => {
    if (filter) {
      setFilter('')
    }
    setShowFilter(!showFilter)
  }

  const handleFilter = (filter: string) => {
    setFilter(filter)
  }

  const move = (id: Identifier, toBeforeId: Identifier) => {
    environments?.move(id, toBeforeId)
  }

  const importEnvironment = () => {
    window.electron?.ipcRenderer.send(ENVIRONMENTS.import)
  }

  const emptyEnvironments = environments?.getAll().length === 0

  return (
    <>
      <div className="sidePanel-header">
        <div
          className={`sidePanel-header-title ${selectedEnvironment ? 'cursor-pointer' : ''}`}
          onClick={() => setSelectedEnvironment(null)}
        >
          Environments
        </div>
        {!selectedEnvironment && (
          <>
            {!emptyEnvironments && (
              <div>
                <ButtonIcon
                  icon="filter"
                  onClick={() => setShowFilter(!showFilter)}
                  title="Filter"
                />
              </div>
            )}
            <div>
              <ButtonIcon icon="save" onClick={importEnvironment} title="Import an environment" />
            </div>
            <div>
              <ButtonIcon icon="more" onClick={add} title="Create new environment" />
            </div>
          </>
        )}
      </div>
      {selectedEnvironment && (
        <Environment
          environment={selectedEnvironment}
          back={() => setSelectedEnvironment(null)}
          update={update}
          remove={remove}
        />
      )}
      {!selectedEnvironment && !emptyEnvironments && (
        <Scrollable
          className={`sidePanel-content ${styles.content}`}
          onStartScroll={() => setIsScrolling(true)}
          onEndScroll={() => setIsScrolling(false)}
        >
          {showFilter && (
            <div className={styles.filter}>
              <FilterInput onClear={handleShowFilter} onFilter={handleFilter} />
            </div>
          )}
          {envs
            .filter(
              (environment) =>
                !showFilter || environment.name.toLowerCase().includes(filter.toLowerCase())
            )
            .map((environment) => (
              <EnvironmentItem
                key={environment.id}
                environment={environment}
                selectEnvironment={setSelectedEnvironment}
                activeEnvironment={(id) => environments?.active(id)}
                deactiveEnvironment={() => environments?.deactive()}
                move={move}
                remove={remove}
                duplicate={duplicate}
                isScrolling={isScrolling}
              />
            ))}
        </Scrollable>
      )}

      {!selectedEnvironment && emptyEnvironments && (
        <div className="sidePanel-content">
          <div className="sidePanel-content-empty">
            <div className="sidePanel-content-empty-text">
              You don&apos;t have any environments yet.
            </div>
            <div className="sidePanel-content-empty-actions">
              <button onClick={add} className="sidePanel-content-empty-button">
                <Icon icon="more" />
                <span className="sidePanel-content-empty-button-label">Create new environment</span>
              </button>
              <button onClick={importEnvironment} className="sidePanel-content-empty-button">
                <Icon icon="save" />
                <span className="sidePanel-content-empty-button-label">Import an environment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
