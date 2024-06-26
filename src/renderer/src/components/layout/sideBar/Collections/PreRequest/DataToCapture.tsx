import React, { useState } from 'react'
import styles from './PreRequest.module.css'
import ButtonIcon from '../../../../base/ButtonIcon'
import SimpleTable from '../../../../base/SimpleTable/SimpleTable'
import DataToCaptureItem from './DataToCaptureItem'

export default function DataToCapture({
  items,
  onSave
}: {
  items: PreRequestDataToCapture[]
  onSave: (captureItems: PreRequestDataToCapture[]) => void
}) {
  const [pathSize, setPathSize] = useState(300)

  const changePathSize = (offset: number) => {
    const newSize = pathSize + offset
    setPathSize(Math.max(Math.min(newSize, 360), 100))
  }

  const handleAdd = () => {
    onSave([
      ...items,
      {
        id: new Date().getTime(),
        type: 'body',
        path: '',
        setEnvironmentVariable: ''
      }
    ])
  }

  const handleChange = (changeItem: PreRequestDataToCapture) => {
    onSave(items.map((item) => (item.id === changeItem.id ? changeItem : item)))
  }

  const handleDelete = (id: Identifier) => {
    onSave(items.filter((item) => item.id !== id))
  }

  return (
    <div className={styles.dataToCapture}>
      <SimpleTable templateColumns={`100px ${pathSize}px 1fr 2rem`}>
        <SimpleTable.Header>
          <SimpleTable.HeaderCell>Type</SimpleTable.HeaderCell>
          <SimpleTable.HeaderCell draggable={true} onDrag={changePathSize}>
            Path
          </SimpleTable.HeaderCell>
          <SimpleTable.HeaderCell>Environment Variable</SimpleTable.HeaderCell>
          <SimpleTable.HeaderCell>
            <></>
          </SimpleTable.HeaderCell>
        </SimpleTable.Header>
        <SimpleTable.Body>
          {items.map((item: PreRequestDataToCapture) => (
            <DataToCaptureItem
              key={item.id}
              item={item}
              onChange={(data: PreRequestDataToCapture) => handleChange(data)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </SimpleTable.Body>
      </SimpleTable>
      <div className={styles.add}>
        <div>
          <ButtonIcon icon="more" onClick={handleAdd} />
        </div>
      </div>
    </div>
  )
}
