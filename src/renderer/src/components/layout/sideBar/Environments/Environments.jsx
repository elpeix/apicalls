import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Environment from './Environment'
import EnvironmentItem from './EnvironmentItem'

export default function Environments() {

  const { environments } = useContext(AppContext)
  const [selectedEnvironment, setSelectedEnvironment] = useState(null)

  const add = () => {
    const environment = environments.create()
    setSelectedEnvironment(environment)
  }

  const update = (environment) =>  environments.update(environment)

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
            <EnvironmentItem 
              key={environment.id}
              environment={environment}
              selectEnvironment={setSelectedEnvironment}
              activeEnvironment={id => environments.active(id)}
              deactiveEnvironment={() => environments.deactive()}
            />
          ))}
        </div>
      )}
    </>
  )
}
