import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ENVIRONMENTS, WORKSPACES } from '../../../../../../lib/ipcChannels'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Environment from './Environment'
import EnvironmentItem from './EnvironmentItem'
import styles from './Environment.module.css'
import { FilterInput } from '../../../base/FilterInput/FilterInput'
import Scrollable from '../../../base/Scrollable'

export default function Environments() {
  const { application, environments } = useContext(AppContext)

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
    ipcRenderer?.on(ENVIRONMENTS.importFailure, (_: unknown, message: string) => {
      application.showAlert({ message })
    })
    ipcRenderer?.on(WORKSPACES.changed, () => {
      setSelectedEnvId(null)
    })
    return () => {
      ipcRenderer?.removeAllListeners(ENVIRONMENTS.importFailure)
      ipcRenderer?.removeAllListeners(WORKSPACES.changed)
    }
  }, [environments, application])

  const setSelectedEnvironment = (env: Environment | null) => {
    setSelectedEnvId(env ? env.id : null)
  }

  const add = () => {
    if (!environments) return
    const environment = environments.create()
    setSelectedEnvId(environment.id)
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
            <div>
              <ButtonIcon icon="filter" onClick={() => setShowFilter(!showFilter)} title="Filter" />
            </div>
            <div>
              <ButtonIcon icon="save" onClick={importEnvironment} title="Import environment" />
            </div>
            <div>
              <ButtonIcon icon="more" onClick={add} title="New environment" />
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
      {!selectedEnvironment && (
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
    </>
  )
}
