import fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { defaultSettings } from '../lib/defaults'

export function backupConfig(previousVersion: string) {
  const userDataPath = getUserDataPath()
  const configPath = path.join(userDataPath, 'config.json')
  if (fs.existsSync(configPath)) {
    console.info('Backup config.json')
    const configBakPath = path.join(userDataPath, `config.bak-${previousVersion}.json`)
    fs.copyFileSync(configPath, configBakPath)
  }
}

export function splitConfig() {
  const userDataPath = getUserDataPath()
  const configPath = path.join(userDataPath, 'config.json')
  if (!fs.existsSync(configPath)) {
    return
  }
  console.info('Split config.json: settings.json & workspace.json')
  const config = getData(configPath)

  const settings = {
    settings: config?.settings || defaultSettings
  }
  const settingsPath = path.join(userDataPath, 'settings.json')
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))

  const workspace = {
    tabs: config?.tabs || [],
    environments: config?.environments || [],
    collections: config?.collections || [],
    cookies: config?.cookies || []
  }
  const workspacePath = path.join(userDataPath, 'workspace.json')
  fs.writeFileSync(workspacePath, JSON.stringify(workspace, null, 2))
  fs.unlinkSync(configPath)
}

const getUserDataPath = () => app.getPath('userData')

function getData(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (_) {
    return null
  }
}
