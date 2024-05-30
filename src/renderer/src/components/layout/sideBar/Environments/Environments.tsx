import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Environment from './Environment'
import EnvironmentItem from './EnvironmentItem'
import styles from './Environment.module.css'
import { FilterInput } from '../../../base/FilterInput/FilterInput'

export default function Environments() {
  const { environments } = useContext(AppContext)

  const [envs, setEnvs] = useState<Environment[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!environments) return
    setEnvs(environments.getAll())
    if (selectedEnvironment) {
      const env = environments.get(selectedEnvironment.id)
      if (env) setSelectedEnvironment(env)
    }
  }, [environments, selectedEnvironment])

  const add = () => {
    if (!environments) return
    const environment = environments.create()
    setSelectedEnvironment(environment)
  }

  const update = (environment: Environment) => {
    if (!environments) return
    environments.update(environment)
  }

  const remove = () => {
    if (!selectedEnvironment || !environments) return
    environments.remove(selectedEnvironment.id)
    setSelectedEnvironment(null)
  }

  const handleShowFilter = () => {
    filter && setFilter('')
    setShowFilter(!showFilter)
  }

  const handleFilter = (filter: string) => {
    setFilter(filter)
  }

  return (
    <>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Environments</div>
        {!selectedEnvironment && (
          <>
            <div>
              <ButtonIcon icon="filter" onClick={() => setShowFilter(!showFilter)} title="Filter" />
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
        <div className={`sidePanel-content ${styles.content}`}>
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
              />
            ))}
        </div>
      )}
    </>
  )
}
