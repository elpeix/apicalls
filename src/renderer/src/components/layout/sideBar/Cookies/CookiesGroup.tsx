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
  const [cookieList, setCookieList] = useState(cookies)

  useEffect(() => {
    setCookieList(cookies)
  }, [cookies])

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

  const addCookie = () => {
    const newCookies = [
      ...cookieList,
      {
        name: '',
        value: '',
        domain: group,
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: false,
        path: '/',
        sameSite: 'Lax',
        secure: false
      } as Cookie
    ]
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
        <SimpleTable templateColumns={`100px 180px 50px minmax(1rem, 1fr) 2rem`}>
          <SimpleTable.Header>
            <SimpleTable.HeaderCell draggable={true} maxWidth={300}>
              Name
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell draggable={true} maxWidth={500}>
              Value
            </SimpleTable.HeaderCell>
            <SimpleTable.HeaderCell draggable={true} maxWidth={300}>
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
        <div className={styles.footer}>
          <div className={styles.add}>
            <div>
              <ButtonIcon icon="more" onClick={addCookie} title="Add cookie" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
