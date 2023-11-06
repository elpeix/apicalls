import React from 'react'
import SimpleTable from '../base/SimpleTable/SimpleTable'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Request.module.css'

export default function Params({ params, addParam, setParams }) {

  return (
    <div className={styles.params}>
      { params && params.length > 0 && (
        <SimpleTable templateColumns="30px 1fr 1fr 40px">
          <SimpleTable.Header>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Name</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Value</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell></SimpleTable.HeaderCell>
          </SimpleTable.Header>
          <SimpleTable.Body>
            { params.map((param, index) => (
              <SimpleTable.Row key={index} className={param.enabled ? styles.rowEnabled : ''}>
                <SimpleTable.Cell>
                  <input 
                    type ='checkbox'
                    checked={param.enabled}
                    onChange={e => {
                      const newParams = [...params]
                      newParams[index].enabled = e.target.checked
                      setParams(newParams)
                    }}
                  />
                </SimpleTable.Cell>
                <SimpleTable.Cell 
                  editable 
                  autoFocus={param.name === ''}
                  value={param.name}
                  placeholder='Enter name...'
                  onChange={value => {
                    const newParams = [...params]
                    newParams[index].name = value
                    setParams(newParams)
                  }}
                />
                <SimpleTable.Cell 
                  editable 
                  value={param.value}
                  placeholder='Enter value...'
                  onChange={value => {
                    const newParams = [...params]
                    newParams[index].value = value
                    setParams(newParams)
                  }}
                />
                <SimpleTable.Cell>
                  <ButtonIcon
                    icon='delete'
                    onClick={() => {
                      const newParams = [...params]
                      newParams.splice(index, 1)
                      setParams(newParams)
                    }}
                  />
                </SimpleTable.Cell> 
              </SimpleTable.Row>
            )) }
          </SimpleTable.Body>
        </SimpleTable>
      )}
      <button className={styles.add} onClick={addParam}>
        Add Param
      </button>
    </div>
  )
}
