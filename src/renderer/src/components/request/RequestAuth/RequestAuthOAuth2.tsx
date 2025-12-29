import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './RequestAuth.module.css'
import Autocompleter from '../../base/Autocompleter/Autocompleter'
import { OAUTH } from '../../../../../lib/ipcChannels'
import { Button } from '../../base/Buttons/Buttons'
import { AppContext } from '../../../context/AppContext'
import { RequestContext } from '../../../context/RequestContext'
import ButtonIcon from '../../base/ButtonIcon'

export default function RequestAuthOAuth2() {
  const { application } = useContext(AppContext)
  const { request, getRequestEnvironment } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const [authValue, setAuthValue] = useState<RequestAuthOAuth2 | null>(null)

  const environmentId = getRequestEnvironment()?.id

  useEffect(() => {
    if (request) {
      const authVal = (request.auth?.value as RequestAuthOAuth2) || {
        grantType: 'authorization_code',
        clientId: '',
        authorizationUrl: '',
        accessTokenUrl: '',
        callbackUrl: '',
        scope: '',
        accessToken: ''
      }
      const authOAuthValue: RequestAuthOAuth2 = {
        grantType: 'authorization_code',
        clientId: authVal.clientId,
        authorizationUrl: authVal.authorizationUrl,
        accessTokenUrl: authVal.accessTokenUrl,
        callbackUrl: authVal.callbackUrl,
        scope: authVal.scope,
        accessToken: authVal.accessToken
      }
      setAuthValue(authOAuthValue)
    }
  }, [request])

  const handleOAuthChange = (key: keyof RequestAuthOAuth2, value: string) => {
    const currentAuth = (authValue as RequestAuthOAuth2) || {
      grantType: 'authorization_code',
      clientId: '',
      authorizationUrl: '',
      accessTokenUrl: '',
      callbackUrl: '',
      scope: '',
      accessToken: ''
    }
    const newAuth = { ...currentAuth, [key]: value }
    setAuthValue(newAuth)
    request?.setAuth({ type: 'oauth2', value: newAuth })
  }

  const handleGetToken = async () => {
    const currentAuth = authValue as RequestAuthOAuth2
    if (!currentAuth) return

    try {
      const token = await window.electron.ipcRenderer.invoke(OAUTH.getToken, currentAuth)
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

  const currentOAuth = authValue as RequestAuthOAuth2
  const isOAuthValid =
    currentOAuth?.clientId &&
    currentOAuth?.authorizationUrl &&
    currentOAuth?.accessTokenUrl &&
    currentOAuth?.callbackUrl &&
    currentOAuth?.scope

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
            value={(authValue as RequestAuthOAuth2)?.clientId || ''}
            offsetX={-9}
            offsetY={8}
            environmentId={environmentId}
          />
        </label>
        {(authValue as RequestAuthOAuth2)?.grantType === 'authorization_code' && (
          <label>
            <span className={styles.label}>Client Secret</span>
            <Autocompleter
              inputRef={inputRef}
              placeholder="Client Secret"
              className={styles.authorizationInput}
              onChange={(val) => handleOAuthChange('clientSecret', val)}
              value={(authValue as RequestAuthOAuth2)?.clientSecret || ''}
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
            value={(authValue as RequestAuthOAuth2)?.callbackUrl || ''}
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
            value={(authValue as RequestAuthOAuth2)?.authorizationUrl || ''}
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
            value={(authValue as RequestAuthOAuth2)?.accessTokenUrl || ''}
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
            value={(authValue as RequestAuthOAuth2)?.scope || ''}
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
        {(authValue as RequestAuthOAuth2)?.accessToken && (
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
