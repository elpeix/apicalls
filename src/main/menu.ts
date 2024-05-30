import { Menu, MenuItemConstructorOptions } from 'electron'

const menuTemplate: Array<MenuItemConstructorOptions> = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }
    ]
  },
  {
    label: 'View',
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
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  }
]

export const menu = Menu.buildFromTemplate(
  menuTemplate as Array<Electron.MenuItemConstructorOptions>
)
