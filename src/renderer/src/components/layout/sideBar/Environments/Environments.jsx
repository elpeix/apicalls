import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Environment from './Environment'

export default function Environments() {

  const { environments } = useContext(AppContext)
  const [selectedEnvironment, setSelectedEnvironment] = useState(null)

  const add = () => {
    const environment = environments.create()
    setSelectedEnvironment(environment)
  }

  const update = (environment) => {
    environments.update(environment)
  }

  const remove = () => {
    environments.remove(selectedEnvironment.id)
    setSelectedEnvironment(null)
  }

  return (
    <>
      <div className='sidePanel-header'>
        <div className='sidePanel-header-title'>Environments</div>
        { !selectedEnvironment && (
          <div><ButtonIcon icon='more' onClick={add} /></div>
        )}
      </div>
      { selectedEnvironment && (
        <Environment
          environment={selectedEnvironment}
          back={() => setSelectedEnvironment(null)}
          update={update}
          remove={remove}
        />
      )}
      { !selectedEnvironment && (
        <div className='sidePanel-content'>
          {environments.getAll().map((environment) => (
            <div className='sidePanel-content-item item-row' key={environment.id} onClick={() => setSelectedEnvironment(environment)}>
              <input 
                type ='checkbox'
                checked={environment.selected}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  if (e.target.checked) {
                    environments.select(environment.id)
                  } else {
                    environments.deselect()
                  }
                }}
              />
              <div>
                {environment.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
