import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import CookiesGroup from './CookiesGroup'
import Icon from '../../../base/Icon/Icon'

export default function Cookies() {
  const { cookies, application } = useContext(AppContext)
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  if (!cookies) {
    return null
  }

  const groups = cookies.getGroups()
  const groupedCookies = cookies.getGrouped()

  const handleUpdateGroup = (group: string, groupCookies: Cookie[]) => {
    cookies.updateGroup(group, groupCookies)
  }

  const handleRemoveGroup = (group: string) => {
    cookies.remove(group)
    setSelectedGroup('')
  }

  const handleAddGroup = () => {
    application.showPrompt({
      message: 'Enter domain',
      placeholder: '.domain.com',
      onConfirm: (domain) => {
        cookies.createGroup(domain)
        setSelectedGroup(domain)
        application.hidePrompt()
      },
      onCancel: () => {
        application.hidePrompt()
      }
    })
  }

  const emptyGroups = groups.length === 0

  return (
    <>
      <div className="sidePanel-header">
        <div
          className={`sidePanel-header-title ${selectedGroup ? 'cursor-pointer' : ''}`}
          onClick={() => setSelectedGroup('')}
        >
          Cookies
        </div>
        {!selectedGroup && (
          <>
            {!emptyGroups && (
              <div>
                <ButtonIcon
                  icon="clear"
                  onClick={() => cookies.clear()}
                  title="Clear all cookies"
                />
              </div>
            )}
            <div>
              <ButtonIcon icon="more" onClick={handleAddGroup} title="Create new domain" />
            </div>
          </>
        )}
      </div>
      {selectedGroup && (
        <CookiesGroup
          group={selectedGroup}
          cookies={groupedCookies.get(selectedGroup) || []}
          back={() => setSelectedGroup('')}
          update={handleUpdateGroup}
          remove={handleRemoveGroup}
        />
      )}
      {!selectedGroup && !emptyGroups && (
        <div className="sidePanel-content">
          {groups.map((group, index) => (
            <div
              key={`group_${index}`}
              className="sidePanel-content-item"
              onClick={() => setSelectedGroup(group)}
            >
              <div>{group}</div>
            </div>
          ))}
        </div>
      )}
      {emptyGroups && (
        <div className="sidePanel-content">
          <div className="sidePanel-content-empty">
            <div className="sidePanel-content-empty-text">
              <div>There are no cookies. </div>
              <div className="sidePanel-content-empty-text-sub">
                They will be added automatically if any request returns them, but you can also
                create them manually.
              </div>
            </div>
            <div className="sidePanel-content-empty-actions">
              <button onClick={handleAddGroup} className="sidePanel-content-empty-button">
                <Icon icon="more" />
                <span className="sidePanel-content-empty-button-label">Create new domain</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
