import fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export function backupConfig() {
  console.info('Backup config.json')
  const configPath = path.join(app.getPath('userData'), 'config.json')
  const configBakPath = path.join(app.getPath('userData'), 'config.bak.json')
  fs.copyFileSync(configPath, configBakPath)
}
