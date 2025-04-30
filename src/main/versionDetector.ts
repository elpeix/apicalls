import fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

const appVersionPath = path.join(app.getPath('userData'), 'version.json')
const currentVersion = app.getVersion()

export function onChangeVersion(
  callback: (previousVersion: string, currentVersion: string) => void
) {
  const appVersion = getVersion(appVersionPath)
  if (appVersion < currentVersion) {
    saveAppVersion()
    callback(appVersion, currentVersion)
  }
}

export function getVersion(filePath: string): string {
  const baseVersion = '0.0.0'
  try {
    const versionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return versionData.version || baseVersion
  } catch (_) {
    return baseVersion
  }
}

function saveAppVersion() {
  const data = {
    version: currentVersion
  }
  fs.writeFileSync(appVersionPath, JSON.stringify(data, null, 2))
}
