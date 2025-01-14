import React, { useEffect, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import SimpleTable from '../../../base/SimpleTable/SimpleTable'

export default function Cookie({
  cookie,
  index,
  update,
  remove
}: {
  cookie: Cookie
  index: number
  update: (cookie: Cookie, index: number) => void
  remove: (index: number) => void
}) {
  const [cookieData, setCookieData] = useState(cookie)

  useEffect(() => {
    setCookieData(cookie)
  }, [cookie])

  const updateValue = (key: string, value: string | Date) => {
    const newCookie = { ...cookieData, [key]: value }
    setCookieData(newCookie)
    update(newCookie, index)
  }

  const updateDate = (dateString: string) => {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      updateValue('expires', date)
    }
  }

  return (
    <SimpleTable.Row>
      <SimpleTable.Cell
        editable
        value={cookieData.name}
        onChange={(value) => updateValue('name', value)}
      />
      <SimpleTable.Cell
        editable
        value={cookieData.value}
        onChange={(value) => updateValue('value', value)}
      />
      <SimpleTable.Cell
        editable
        value={cookieData.path}
        onChange={(value) => updateValue('path', value)}
      />
      <SimpleTable.Cell
        editable
        value={new Date(cookieData.expires).toJSON()}
        onChange={updateDate}
      />
      <SimpleTable.Cell>
        <ButtonIcon icon="delete" onClick={() => remove(index)} title="Remove cookie" />
      </SimpleTable.Cell>
    </SimpleTable.Row>
  )
}
