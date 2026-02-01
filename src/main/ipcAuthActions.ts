import { BrowserWindow, ipcMain } from 'electron'
import { OAUTH } from '../lib/ipcChannels'
import { fetch } from 'undici'
import { mainWindow } from '.'

function sendLog(log: RequestLog | string, type: 'request' | 'response' | 'error' = 'request') {
  if (typeof log === 'string') {
    mainWindow?.webContents.send(OAUTH.log, { type, message: log })
    return
  }
  mainWindow?.webContents.send(OAUTH.log, { ...log, type })
}

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

  const getLog: RequestLog = {
    type: 'request',
    method: 'GET',
    url: authUrl.toString(),
    time: 0,
    request: {
      url: authUrl.toString(),
      method: { value: 'GET', label: 'GET', body: false },
      headers: {},
      body: ''
    },
    response: {
      id: Date.now(),
      result: undefined,
      status: { code: -1, text: 'Unknown' },
      contentLength: 0,
      responseTime: { all: 0, data: 0, response: 0 },
      responseHeaders: [],
      sentBody: ''
    }
  }
  sendLog(getLog)

  authWindow.loadURL(authUrl.toString())
  authWindow.show()

  return new Promise((resolve, reject) => {
    let isResolving = false

    const handleCallback = async (url: string) => {
      if (isResolving) {
        return
      }
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get('code')
      const error = urlObj.searchParams.get('error')

      if (code) {
        isResolving = true
        authWindow.close()
        try {
          // Exchange code for token
          const startTime = Date.now()
          const requestBody = JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret || '',
            code,
            grant_type: 'authorization_code',
            redirect_uri: callbackUrl
          })
          const requestHeaders = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }

          const tokenResponse = await fetch(accessTokenUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
          })

          const endTime = Date.now()
          const duration = endTime - startTime

          const responseText = await tokenResponse.text()
          const responseHeaders: KeyValue[] = []
          tokenResponse.headers.forEach((value, key) => {
            responseHeaders.push({ name: key, value: String(value), enabled: true })
          })

          const requestLog: RequestLog = {
            type: 'request',
            method: 'POST',
            url: accessTokenUrl,
            status: tokenResponse.status,
            time: duration,
            request: {
              url: accessTokenUrl,
              method: { value: 'POST', label: 'POST', body: true },
              headers: Object.entries(requestHeaders).reduce(
                (acc, [key, value]) => {
                  acc[key] = value
                  return acc
                },
                {} as Record<string, string>
              ),
              body: requestBody
            },
            response: {
              id: Date.now(), // Temporary ID
              result: responseText,
              status: {
                code: tokenResponse.status,
                text: tokenResponse.statusText
              },
              contentLength: responseText.length,
              responseTime: {
                all: duration,
                data: 0,
                response: duration
              },
              responseHeaders: responseHeaders,
              sentBody: requestBody
            }
          }

          sendLog(requestLog)

          const tokenData = JSON.parse(responseText) as { access_token: string }
          if (tokenData.access_token) {
            resolve(tokenData.access_token)
          } else {
            console.error(
              'Failed to retrieve access token. Available keys:',
              Object.keys(tokenData)
            )
            reject(new Error('Failed to retrieve access token'))
          }
        } catch (err) {
          sendLog(`Error during token exchange: ${err}`, 'error')
          reject(err)
        }
      } else if (error) {
        sendLog(`OAuth Error: ${error}`, 'error')
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
        // sendLog('Authentication cancelled by user', 'error')
        reject(new Error('Authentication cancelled'))
      }
    })
  })
})
