import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import styles from './Environments.module.css'
import ButtonIcon from '../../../base/ButtonIcon'

export default function Environments() {

  const { environments } = useContext(AppContext)

  const [selectedEnvironment, setSelectedEnvironment] = useState(null)

  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>
          Environments
        </div>
      </div>
      { selectedEnvironment && (
        <div className={styles.selectedEnvironment}>
          <div className={styles.selectedEnvironmentHeader}>
            <div className={styles.back}>
              <ButtonIcon icon='back' onClick={() => setSelectedEnvironment(null)} />
            </div>
            <div className={styles.title}>{selectedEnvironment.name}</div>
          </div>
          <div className={styles.content}>
            {selectedEnvironment.variables.map((variable, index) => (
              <div className={styles.variable} key={index}>
                <input className={styles.name} value={variable.name} />
                <input className={styles.value} value={variable.value} />
                <div>
                  <ButtonIcon icon='delete' />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      { !selectedEnvironment && (
        <div className={styles.list}>
          {environments.getAll().map((environment) => (
            <div className={styles.item} key={environment.id} onClick={() => setSelectedEnvironment(environment)}>
              {environment.name}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
