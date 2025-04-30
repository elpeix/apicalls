import fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { getVersion } from './versionDetector'

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
