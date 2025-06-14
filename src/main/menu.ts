import { Menu, MenuItemConstructorOptions, BrowserWindow, shell } from 'electron'
import { ACTIONS, SETTINGS, VERSION } from '../lib/ipcChannels'
import { getSettings, setSettings, toggleRequestView } from '../lib/settings'

export const getMenu = (mainWindow: BrowserWindow) => {
  const isMac = process.platform === 'darwin'

  const menuTemplate: Array<MenuItemConstructorOptions> = [
    {
      label: 'File',
      submenu: getFileSubmenu(mainWindow, isMac)
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Actions',
      submenu: [
        {
          label: 'Send Request',
          accelerator: 'CmdOrCtrl+Enter',
          click: () => {
            mainWindow.webContents.send(ACTIONS.sendRequest)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Find Request',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send(ACTIONS.findRequest)
          }
        },
        {
          label: 'Find Tab',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send(ACTIONS.searchTab)
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Collections',
          accelerator: 'CmdOrCtrl+l',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showCollections)
          }
        },
        {
          label: 'Environments',
          accelerator: 'CmdOrCtrl+e',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showEnvironments)
          }
        },
        {
          label: 'History',
          accelerator: 'CmdOrCtrl+h',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showHistory)
          }
        },
        {
          id: 'cookies',
          label: 'Cookies',
          accelerator: 'CmdOrCtrl+g',
          visible: getSettings().manageCookies || false,
          click: () => {
            mainWindow.webContents.send(ACTIONS.showCookies)
          }
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          visible: !isMac,
          click: () => {
            mainWindow.webContents.send(ACTIONS.showSettings)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle menu',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            toggleMenu(mainWindow)
          }
        },
        {
          label: 'Toggle Request view',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => {
            toggleRequestView(mainWindow)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send(ACTIONS.toggleSidebar)
          }
        },
        {
          label: 'Request Panel',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send(ACTIONS.toggleRequestPanel)
          }
        },
        {
          label: 'Console',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            mainWindow.webContents.send(ACTIONS.toggleConsole)
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Submit a bug or idea',
          click: () => {
            shell.openExternal('https://github.com/elpeix/apicalls/issues/new/choose')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'DevTools',
          accelerator: 'F12',
          role: 'toggleDevTools'
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload'
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          role: 'forceReload'
        },
        {
          type: 'separator'
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+Shift+0',
          role: 'resetZoom'
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Shift+Plus',
          role: 'zoomIn'
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+Shift+-',
          role: 'zoomOut'
        },
        {
          type: 'separator',
          visible: !isMac
        },
        {
          label: 'About',
          visible: !isMac,
          click: () => {
            mainWindow.webContents.send(VERSION.show)
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(menuTemplate as Array<Electron.MenuItemConstructorOptions>)
}

const toggleMenu = (mainWindow: BrowserWindow) => {
  const settings = getSettings()
  settings.menu = !settings.menu || false
  setSettings(settings)
  mainWindow.setMenuBarVisibility(settings.menu)
  mainWindow.setAutoHideMenuBar(!settings.menu)
  mainWindow.webContents.send(SETTINGS.updated, settings)
}

const getFileSubmenu = (
  mainWindow: BrowserWindow,
  isMac: boolean
): Array<MenuItemConstructorOptions> => {
  const fileSubmenu: Array<MenuItemConstructorOptions> = []
  if (isMac) {
    fileSubmenu.push({
      label: 'About API Calls',
      click: () => {
        mainWindow.webContents.send(VERSION.show)
      }
    })
    fileSubmenu.push({ type: 'separator' })
    fileSubmenu.push({
      label: 'Settings',
      accelerator: 'CmdOrCtrl+,',
      click: () => {
        mainWindow.webContents.send(ACTIONS.showSettings)
      }
    })
    fileSubmenu.push({ type: 'separator' })
  }
  fileSubmenu.push({
    label: 'New Tab',
    accelerator: 'CmdOrCtrl+T',
    click: () => {
      mainWindow.webContents.send(ACTIONS.newTab)
    }
  })
  fileSubmenu.push({
    label: 'Close Tab',
    accelerator: 'CmdOrCtrl+W',
    click: () => {
      mainWindow.webContents.send(ACTIONS.closeTab)
    }
  })
  fileSubmenu.push({ type: 'separator' })
  fileSubmenu.push({
    label: 'Save Request',
    accelerator: 'CmdOrCtrl+S',
    click: () => {
      mainWindow.webContents.send(ACTIONS.saveRequest)
    }
  })
  fileSubmenu.push({
    label: 'Save Request As',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: () => {
      mainWindow.webContents.send(ACTIONS.saveAsRequest)
    }
  })
  fileSubmenu.push({ type: 'separator' })
  fileSubmenu.push({
    label: 'Exit',
    accelerator: 'CmdOrCtrl+Q',
    role: 'quit'
  })
  return fileSubmenu
}
