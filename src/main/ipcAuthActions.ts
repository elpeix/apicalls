import { BrowserWindow, ipcMain } from 'electron'
import { OAUTH } from '../lib/ipcChannels'
import { fetch } from 'undici'
import { mainWindow } from '.'

ipcMain.handle(OAUTH.getToken, async (_, config: RequestAuthOAuth2) => {
  const { clientId, clientSecret, authorizationUrl, callbackUrl, scope, accessTokenUrl } = config

  const authWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    parent: mainWindow || undefined,
    modal: true,
    show: false
  })

  const authUrl = new URL(authorizationUrl)
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', callbackUrl)
  authUrl.searchParams.append('scope', scope)
  authUrl.searchParams.append('response_type', 'code')

  authWindow.loadURL(authUrl.toString())
  authWindow.show()

  return new Promise((resolve, reject) => {
    let isResolving = false

    const handleCallback = async (url: string) => {
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get('code')
      const error = urlObj.searchParams.get('error')

      if (code) {
        isResolving = true
        authWindow.close()
        try {
          // Exchange code for token
          const tokenResponse = await fetch(accessTokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret || '',
              code,
              grant_type: 'authorization_code',
              redirect_uri: callbackUrl
            })
          })

          const tokenData = (await tokenResponse.json()) as { access_token: string }
          if (tokenData.access_token) {
            resolve(tokenData.access_token)
          } else {
            console.error('Available token response data:', tokenData)
            reject(new Error('Failed to retrieve access token'))
          }
        } catch (err) {
          reject(err)
        }
      } else if (error) {
        isResolving = true
        authWindow.close()
        reject(new Error(`OAuth Error: ${error}`))
      }
    }

    authWindow.webContents.on('will-redirect', (event, url) => {
      if (url.startsWith(callbackUrl)) {
        event.preventDefault()
        handleCallback(url)
      }
    })

    authWindow.webContents.on('will-navigate', (event, url) => {
      if (url.startsWith(callbackUrl)) {
        event.preventDefault()
        handleCallback(url)
      }
    })

    authWindow.on('closed', () => {
      if (!isResolving) {
        reject(new Error('Authentication cancelled'))
      }
    })
  })
})
