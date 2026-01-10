import React, { useContext } from 'react'
import styles from './RequestAuth.module.css'
import { RequestContext } from '../../../context/RequestContext'
import SimpleSelect from '../../base/SimpleSelect/SimpleSelect'
import RequestAuthOAuth2 from './RequestAuthOAuth2'
import RequestAuthBasic from './RequestAuthBasic'
import RequestAuthBearer from './RequestAuthBearer'

export default function RequestAuth() {
  const { request } = useContext(RequestContext)

  const authOptions: { value: RequestAuthType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer' },
    { value: 'basic', label: 'Basic' },
    { value: 'oauth2', label: 'OAuth 2.0' }
  ]
  const authType = request?.auth?.type || 'none'

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = authOptions.find((option) => option.value === e.target.value)
    if (option && option.value !== authType) {
      const authValue =
        option.value === 'basic'
          ? { username: '', password: '' }
          : option.value === 'bearer'
            ? ''
            : option.value === 'oauth2'
              ? {
                  grantType: 'authorization_code',
                  clientId: '',
                  authorizationUrl: '',
                  accessTokenUrl: '',
                  callbackUrl: '',
                  scope: '',
                  accessToken: ''
                }
              : undefined

      request?.setAuth({ type: option.value, value: authValue as RequestAuthValue })
    }
  }

  return (
    <div
      className={`${styles.authorization} ${authType === 'basic' ? styles.basic : ''} ${authType === 'oauth2' ? styles.oauth2 : ''}`}
    >
      <SimpleSelect
        options={authOptions}
        value={authType}
        onChange={handleSelectChange}
        className={styles.select}
      />
      {authType === 'bearer' && <RequestAuthBearer />}
      {authType === 'oauth2' && <RequestAuthOAuth2 />}
      {authType === 'basic' && <RequestAuthBasic />}
    </div>
  )
}
