import React, { useContext, useEffect, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import SimpleTable from '../base/SimpleTable/SimpleTable'
import ButtonIcon from '../base/ButtonIcon'

export default function Params() {

  const [params, setParams] = useState([])
  const context = useContext(RequestContext)
  useEffect(() => {
    setParams(context.request.params)
  }, [context.request.params])

  return (
    <div className='request-params'>
      { context.request.params.length > 0 && (
        <SimpleTable templateColumns="30px 1fr 1fr 40px">
          <SimpleTable.Header>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Name</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
          </SimpleTable.Header>
          <SimpleTable.Body>
            { params.map((param, index) => (
              <SimpleTable.Row key={index} className={param.enabled ? 'row-enabled' : ''}>
                <SimpleTable.Cell>
                  <input 
                    type ='checkbox'
                    checked={param.enabled}
                    onChange={e => {
                      const params = [...context.request.params]
                      params[index].enabled = e.target.checked
                      context.request.setParams(params)
                    }}
                  />
                </SimpleTable.Cell>
                <SimpleTable.Cell 
                  editable 
                  autoFocus={param.name === ''}
                  value={param.name}
                  placeholder='Enter name...'
                  onChange={value => {
                    const params = [...context.request.params]
                    params[index].name = value
                    context.request.setParams(params)
                  }}
                />
                <SimpleTable.Cell 
                  editable 
                  value={param.value}
                  placeholder='Enter value...'
                  onChange={value => {
                    const params = [...context.request.params]
                    params[index].value = value
                    context.request.setParams(params)
                  }}
                />
                <SimpleTable.Cell>
                  <ButtonIcon
                    icon='delete'
                    onClick={() => {
                      const params = [...context.request.params]
                      params.splice(index, 1)
                      context.request.setParams(params)
                    }}
                  />
                </SimpleTable.Cell> 
              </SimpleTable.Row>
            )) }
          </SimpleTable.Body>
        </SimpleTable>
      )}
      <button 
        className='add'
        onClick={context.request.addParam}
      >
          Add Param
      </button>
    </div>
  )
}
