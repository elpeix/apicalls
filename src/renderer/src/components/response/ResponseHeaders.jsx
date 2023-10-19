import React from 'react'
import SimpleTable from '../base/SimpleTable/SimpleTable'

export default function ResponseHeaders({ headers }) {

  return (
    <>
      {headers.length > 0 && (
        <div className='response-headers'>
          <SimpleTable templateColumns='1fr 3fr'>
            <SimpleTable.Header>
              <SimpleTable.HeaderCell>Name</SimpleTable.HeaderCell>
              <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            </SimpleTable.Header>
            <SimpleTable.Body>
              { headers.map((header, index) => (
                <SimpleTable.Row key={index}>
                  <SimpleTable.Cell value={header.name} />
                  <SimpleTable.Cell value={header.value} />
                </SimpleTable.Row>
              )) }
            </SimpleTable.Body>
          </SimpleTable>
        </div>
      )}
      {headers.length === 0 && (
        <div>No headers</div>
      )}
    </>
  )
}
