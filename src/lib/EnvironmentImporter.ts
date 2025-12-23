import fs from 'fs'

class EnvironmentImporter {
  constructor(private path: string) {
    this.path = path
    this.validatePath()
  }

  private validatePath() {
    if (!this.path || this.path.trim() === '') {
      throw new Error('Invalid path provided.')
    }
    if (!this.path.endsWith('.json')) {
      throw new Error('Path must point to a JSON file.')
    }
    if (!fs.existsSync(this.path)) {
      throw new Error('File does not exist at the provided path.')
    }
  }

  public import(): Environment {
    const data = this.readFile()
    const json = this.parseJson(data) as Environment
    if (!this.isValidEnvironment(json)) {
      throw new Error('Invalid environment file')
    }
    return {
      id: new Date().getTime(),
      name: json['name'] as string,
      variables: json['variables'],
      requestHeaders: json['requestHeaders']
    } as Environment
  }

  private readFile(): string {
    try {
      return fs.readFileSync(this.path, 'utf-8')
    } catch (_error) {
      throw new Error('path is invalid')
    }
  }

  private parseJson(data: string): object {
    try {
      return JSON.parse(data)
    } catch (_error) {
      throw new Error('Invalid JSON file')
    }
  }

  private isValidEnvironment(data: Environment): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (data['name'] === undefined || data['variables'] === undefined) {
      return false
    }

    return typeof data['name'] === 'string' && Array.isArray(data['variables'])
  }
}

export { EnvironmentImporter }
