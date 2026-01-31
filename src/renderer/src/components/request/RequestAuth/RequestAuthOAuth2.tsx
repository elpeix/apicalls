import React, { useContext, useRef } from 'react'
import styles from './RequestAuth.module.css'
import Autocompleter from '../../base/Autocompleter/Autocompleter'
import { OAUTH } from '../../../../../lib/ipcChannels'
import { Button } from '../../base/Buttons/Buttons'
import { AppContext } from '../../../context/AppContext'
import { useRequestData, useRequestActions, useRequestMeta } from '../../../context/RequestContext'
import ButtonIcon from '../../base/ButtonIcon'

export default function RequestAuthOAuth2() {
  const { application } = useContext(AppContext)
  const { auth } = useRequestData()
  const { setAuth } = useRequestActions()
  const { getRequestEnvironment } = useRequestMeta()

  const inputRef = useRef<HTMLInputElement>(null)

  const environmentId = getRequestEnvironment()?.id

  const authValue: RequestAuthOAuth2 = (auth?.value as RequestAuthOAuth2) || {
    grantType: 'authorization_code',
    clientId: '',
    authorizationUrl: '',
    accessTokenUrl: '',
    callbackUrl: '',
    scope: '',
    accessToken: ''
  }

  const handleOAuthChange = (key: keyof RequestAuthOAuth2, value: string) => {
    const newAuth = { ...authValue, [key]: value }
    setAuth({ type: 'oauth2', value: newAuth })
  }

  const handleGetToken = async () => {
    if (!authValue) return

    try {
      const token = await window.electron.ipcRenderer.invoke(OAUTH.getToken, authValue)
      if (token) {
        handleOAuthChange('accessToken', token)
      }
    } catch (error) {
      application?.showAlert({
        message: 'Failed to get token: ' + error,
        buttonColor: 'danger'
      })
    }
  }

  const isOAuthValid =
    authValue?.clientId &&
    authValue?.authorizationUrl &&
    authValue?.accessTokenUrl &&
    authValue?.callbackUrl &&
    authValue?.scope

  return (
    <div className={styles.oAuth}>
      <div className={styles.oAuthGrid}>
        <label>
          <span className={styles.label}>Client ID</span>
          <Autocompleter
            inputRef={inputRef}
            placeholder="Client ID"
            className={styles.authorizationInput}
            onChange={(val) => handleOAuthChange('clientId', val)}
            value={authValue?.clientId || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
        {authValue?.grantType === 'authorization_code' && (
          <label>
            <span className={styles.label}>Client Secret</span>
            <Autocompleter
              inputRef={inputRef}
              placeholder="Client Secret"
              className={styles.authorizationInput}
              onChange={(val) => handleOAuthChange('clientSecret', val)}
              value={authValue?.clientSecret || ''}
              offsetX={-9}
              offsetY={8}
              environmentId={environmentId}
            />
          </label>
        )}
        <label>
          <span className={styles.label}>Callback URL</span>
          <Autocompleter
            inputRef={inputRef}
            placeholder="e.g. http://localhost/callback"
            className={styles.authorizationInput}
            onChange={(val) => handleOAuthChange('callbackUrl', val)}
            value={authValue?.callbackUrl || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
        <label>
          <span className={styles.label}>Auth URL</span>
          <Autocompleter
            inputRef={inputRef}
            placeholder="Authorization URL"
            className={styles.authorizationInput}
            onChange={(val) => handleOAuthChange('authorizationUrl', val)}
            value={authValue?.authorizationUrl || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
        <label>
          <span className={styles.label}>Token URL</span>
          <Autocompleter
            inputRef={inputRef}
            placeholder="Access Token URL"
            className={styles.authorizationInput}
            onChange={(val) => handleOAuthChange('accessTokenUrl', val)}
            value={authValue?.accessTokenUrl || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
        <label>
          <span className={styles.label}>Scope</span>
          <Autocompleter
            inputRef={inputRef}
            placeholder="Scope"
            className={styles.authorizationInput}
            onChange={(val) => handleOAuthChange('scope', val)}
            value={authValue?.scope || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
      </div>

      <div className={styles.oAuthActions}>
        <Button.Ok onClick={handleGetToken} className={styles.getTokenBtn} disabled={!isOAuthValid}>
          Get Access Token
        </Button.Ok>
        {authValue?.accessToken && (
          <div className={styles.tokenDisplay}>
            <div className={styles.label}>Current Token:</div>
            <div className={styles.tokenValue}>Present</div>
            <ButtonIcon
              icon="delete"
              className={styles.clearTokenBtn}
              title="Clear Token"
              onClick={() => handleOAuthChange('accessToken', '')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
