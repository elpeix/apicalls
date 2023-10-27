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
        { selectedEnvironment && (
          <div className={styles.back}>
            <ButtonIcon icon='back' onClick={() => setSelectedEnvironment(null)} />
          </div>
        )}
        <div className={styles.title}>
          Environments
        </div>
      </div>
      { selectedEnvironment && (
        <div className={styles.selectedEnvironment}>
          <div className={styles.title}>{selectedEnvironment.name}</div>
          <div className={styles.content}>
            {selectedEnvironment.variables.map((variable, index) => (
              <div className={styles.variable} key={index}>
                <div className={styles.name}>{variable.name}</div>
                <div className={styles.value}>{variable.value}</div>
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
