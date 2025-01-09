import React, { useEffect, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Cookies.module.css'
import SimpleTable from '../../../base/SimpleTable/SimpleTable'

export default function CookiesGroup({
  group,
  cookies,
  back,
  update,
  remove
}: {
  group: string
  cookies: Cookie[]
  back: () => void
  update: (group: string, cookies: Cookie[]) => void
  remove: (group: string) => void
}) {
  const [nameSize, setNameSize] = useState(120)
  const [valueSize, setValueSize] = useState(120)
  const [pathSize, setPathSize] = useState(80)
  const [cookieList, setCookieList] = useState(cookies)

  useEffect(() => {
    setCookieList(cookies)
  }, [cookies])

  const changeNameSize = (offset: number) => {
    setNameSize(Math.max(Math.min(nameSize + offset, 300), 80))
  }

  const changeValueSize = (offset: number) => {
    setValueSize(Math.max(Math.min(valueSize + offset, 400), 80))
  }

  const changePathSize = (offset: number) => {
    setPathSize(Math.max(Math.min(pathSize + offset, 300), 40))
  }

  const removeCookie = (index: number) => {
    const newCookies = [...cookieList]
    newCookies.splice(index, 1)
    setCookieList(newCookies)
    update(group, newCookies)
  }

  return (
    <div className={`sidePanel-content ${styles.group}`}>
      <div className={styles.header}>
        <div>
          <ButtonIcon icon="arrow" direction="west" onClick={back} title="Go back" />
        </div>
        <div className={styles.name}>{group}</div>
        <div>
          <ButtonIcon icon="delete" onClick={() => remove(group)} title="Remove domain cookies" />
        </div>
      </div>
      <div className={styles.content}>
        <SimpleTable templateColumns={`${nameSize}px ${valueSize}px ${pathSize}px 1fr 2rem`}>
          <SimpleTable.Header>
            <SimpleTable.HeaderCell draggable={true} onDrag={changeNameSize}>
              Name
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell draggable={true} onDrag={changeValueSize}>
              Value
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell draggable={true} onDrag={changePathSize}>
              Path
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>Expires</SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell>
              <></>
            </SimpleTable.HeaderCell>
          </SimpleTable.Header>
          <SimpleTable.Body className={styles.cookieData}>
            {cookieList.map((cookie, index) => (
              <SimpleTable.Row key={`cookie_${index}`}>
                <SimpleTable.Cell>{cookie.name}</SimpleTable.Cell>
                <SimpleTable.Cell>
                  <div title={cookie.value}>{cookie.value}</div>
                </SimpleTable.Cell>
                <SimpleTable.Cell>{cookie.path}</SimpleTable.Cell>
                <SimpleTable.Cell>{new Date(cookie.expires).toJSON()}</SimpleTable.Cell>
                <SimpleTable.Cell>
                  <ButtonIcon
                    icon="delete"
                    onClick={() => removeCookie(index)}
                    title="Remove cookie"
                  />
                </SimpleTable.Cell>
              </SimpleTable.Row>
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      </div>
    </div>
  )
}
