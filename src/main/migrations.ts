import { compareVersions } from '../lib/utils'

const migrations: Migration[] = []

export abstract class Migration {
  abstract getMinVersion(): string
  abstract run(previousVersion: string, currentVersion: string): void
}

export function migrationRegister(migration: Migration) {
  if (migrations.find((m) => m.getMinVersion() === migration.getMinVersion())) {
    console.warn(`Migration for version ${migration.getMinVersion()} already registered.`)
    return
  }
  migrations.push(migration)
}

export function handleMigrations(previousVersion: string, currentVersion: string) {
  migrations.forEach((migration) => {
    if (
      compareVersions(previousVersion, migration.getMinVersion()) < 0 &&
      compareVersions(currentVersion, migration.getMinVersion()) > -1
    ) {
      console.info(`Running migration for version ${migration.getMinVersion()}.`)
      migration.run(previousVersion, currentVersion)
    }
  })
}
