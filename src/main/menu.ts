import { Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron'
import { ACTIONS, SETTINGS } from '../lib/ipcChannels'
import { getSettings, setSettings } from '../lib/settings'

export const getMenu = (mainWindow: BrowserWindow) => {
  const menuTemplate: Array<MenuItemConstructorOptions> = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send(ACTIONS.newTab)
          }
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send(ACTIONS.closeTab)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Save Request',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send(ACTIONS.saveRequest)
          }
        },
        {
          label: 'Save Request As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send(ACTIONS.saveAsRequest)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit'
        }
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
          accelerator: 'CmdOrCtrl+Shift+T',
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
          label: 'Toggle menu',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            toggleMenu(mainWindow)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Show collections',
          accelerator: 'CmdOrCtrl+l',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showCollections)
          }
        },
        {
          label: 'Show environments',
          accelerator: 'CmdOrCtrl+e',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showEnvironments)
          }
        },
        {
          label: 'Show history',
          accelerator: 'CmdOrCtrl+h',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showHistory)
          }
        },
        {
          label: 'Show settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send(ACTIONS.showSettings)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send(ACTIONS.toggleSidebar)
          }
        },
        {
          label: 'Toggle Request Panel',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send(ACTIONS.toggleRequestPanel)
          }
        },
        {
          label: 'Toggle Console',
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
          label: 'Toggle DevTools',
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
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate as Array<Electron.MenuItemConstructorOptions>)

  return menu
}

const toggleMenu = (mainWindow: BrowserWindow) => {
  const settings = getSettings()
  settings.menu = !settings.menu || false
  setSettings(settings)

  if (settings.menu) {
    mainWindow.setMenuBarVisibility(true)
  } else {
    mainWindow.setMenuBarVisibility(false)
  }
  mainWindow.webContents.send(SETTINGS.updated, settings)
}
