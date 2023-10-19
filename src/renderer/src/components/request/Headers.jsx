import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import SimpleTable from '../base/SimpleTable/SimpleTable'
import ButtonIcon from '../base/ButtonIcon'

export default function Headers() {

  const context = useContext(RequestContext)

  return (
    <div className='request-headers'>
      { context.request.headers.length > 0 && (
        <SimpleTable templateColumns="30px 1fr 1fr 40px">
          <SimpleTable.Header>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Name</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
          </SimpleTable.Header>
          <SimpleTable.Body>
            { context.request.headers.map((header, index) => (
              <SimpleTable.Row key={index} className={header.enabled ? 'row-enabled' : ''}>
                <SimpleTable.Cell >
                  <input 
                    type ='checkbox'
                    checked={header.enabled}
                    onChange={e => {
                      const headers = [...context.request.headers]
                      headers[index].enabled = e.target.checked
                      context.request.setHeaders(headers)
                    }}
                  />
                </SimpleTable.Cell>
                <SimpleTable.Cell 
                  editable 
                  autoFocus={header.name === ''}
                  value={header.name}
                  placeholder='Name'
                  onChange={value => {
                    const headers = [...context.request.headers]
                    headers[index].name = value
                    context.request.setHeaders(headers)
                  }}
                />
                <SimpleTable.Cell 
                  editable 
                  value={header.value}
                  placeholder='Value'
                  onChange={value => {
                    const headers = [...context.request.headers]
                    headers[index].value = value
                    context.request.setHeaders(headers)
                  }}
                />
                <SimpleTable.Cell 
                  value={
                    <ButtonIcon
                      icon='delete'
                      onClick={() => {
                        const headers = [...context.request.headers]
                        headers.splice(index, 1)
                        context.request.setHeaders(headers)
                      }}
                    />
                  }
                />
              </SimpleTable.Row>
            )) }
          </SimpleTable.Body>
        </SimpleTable>
      )}
      <button 
        className='add'
        onClick={context.request.addHeader}
      >
          Add header
      </button>
    </div>
  )
}
