import { compareVersions } from '../lib/utils'

const migrations: Migration[] = []

export abstract class Migration {
  abstract getMinVersion(): string
  abstract run(previousVersion: string): void
}

export function migrationRegister(migration: Migration) {
  if (migrations.find((m) => m.getMinVersion() === migration.getMinVersion())) {
    console.warn(`Migration for version ${migration.getMinVersion()} already registered.`)
    return
  }
  console.info(`Registering migration for versions greather than ${migration.getMinVersion()}.`)
  migrations.push(migration)
}

export function handleMigrations(previousVersion: string) {
  console.info(`Handling migrations for version ${previousVersion}.`)
  migrations.forEach((migration) => {
    if (compareVersions(previousVersion, migration.getMinVersion()) < 0) {
      console.info(`Running migration for version ${migration.getMinVersion()}.`)
      migration.run(previousVersion)
    }
  })
}
