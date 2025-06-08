import { StorerFactory } from '../../lib/appStore'
import { defaultSettings } from '../../lib/defaults'
import { Migration, migrationRegister } from '../migrations'

class MigrationUserAgent extends Migration {
  getMinVersion(): string {
    return '0.11.0'
  }

  run(_: string): void {
    const settingsStore = StorerFactory.getSettingsStore()
    const settings = settingsStore.get('settings', defaultSettings) as AppSettingsType & {
      defaultUserAgent?: string
    }

    if (!settings.defaultUserAgent) {
      return
    }

    const headers = [
      {
        name: 'User-Agent',
        value: settings.defaultUserAgent,
        enabled: true
      } as KeyValue
    ]

    settings.defaultHeaders = headers
    delete settings.defaultUserAgent

    settingsStore.set('settings', settings)
  }
}

migrationRegister(new MigrationUserAgent())
