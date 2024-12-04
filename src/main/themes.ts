import fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

const userDataThemesPath = path.join(app.getPath('userData'), 'themes')
const bundledThemesPath = path.join(app.getAppPath(), 'themes')

export function checkAndUpdateThemes() {
  const userVersionPath = path.join(userDataThemesPath, 'version.json')
  const bundledVersionPath = path.join(bundledThemesPath, 'version.json')
  const userVersion = getVersion(userVersionPath)
  const bundledVersion = getVersion(bundledVersionPath)
  if (userVersion !== bundledVersion) {
    updateThemes()
  }
}

function getVersion(filePath: string): string | null {
  try {
    const versionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return versionData.version
  } catch (_) {
    return null
  }
}

function updateThemes() {
  if (!fs.existsSync(userDataThemesPath)) {
    fs.mkdirSync(userDataThemesPath, { recursive: true })
  }
  fs.readdirSync(bundledThemesPath).forEach((file) => {
    const sourcePath = path.join(bundledThemesPath, file)
    const destPath = path.join(userDataThemesPath, file)
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, destPath, { recursive: true })
    } else {
      fs.copyFileSync(sourcePath, destPath)
    }
  })
}
