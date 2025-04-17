import React, { useEffect, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Cookies.module.css'
import SimpleTable from '../../../base/SimpleTable/SimpleTable'
import Cookie from './Cookie'

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
  const [nameSize, setNameSize] = useState(100)
  const [valueSize, setValueSize] = useState(180)
  const [pathSize, setPathSize] = useState(50)
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

  const updateCookie = (cookie: Cookie, index: number) => {
    const newCookies = [...cookieList]
    newCookies[index] = cookie
    setCookieList(newCookies)
    update(group, newCookies)
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
          <ButtonIcon icon="clear" onClick={() => remove(group)} title="Clear domain cookies" />
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
              <Cookie
                key={`cookie_${index}`}
                cookie={cookie}
                index={index}
                update={updateCookie}
                remove={removeCookie}
              />
            ))}
          </SimpleTable.Body>
        </SimpleTable>
      </div>
    </div>
  )
}
