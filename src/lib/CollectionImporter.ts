/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Create openAPI types
import fs from 'fs'
import YAML from 'yaml'
import { ParserOpenApi } from './ParserOpenApi'
import { ParserPostman } from './ParserPostman'
import { ParserCollection } from './ParserCollection'

class CollectionImporter {
  private collection: Collection | undefined

  constructor(private path: string) {
    this.path = path
    this.validatePath()
  }

  private validatePath() {
    if (!this.path) {
      throw new Error('path is empty')
    }
    if (
      !this.path.endsWith('.json') &&
      !this.path.endsWith('.yaml') &&
      !this.path.endsWith('.yml')
    ) {
      throw new Error('Invalid file type')
    }
    if (!fs.existsSync(this.path)) {
      throw new Error('path is invalid')
    }
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

  private parseYaml(data: string): object {
    try {
      return YAML.parse(data)
    } catch (_error) {
      throw new Error('Invalid YAML file')
    }
  }

  private parseCollection(data: any): Collection {
    let parser: ParserCollection
    if (data.paths) {
      parser = new ParserOpenApi()
    } else if (data.item) {
      parser = new ParserPostman()
    } else {
      throw Error('Invalid collection file')
    }
    return parser.parse(data)
  }

  public async *import(): AsyncGenerator<number> {
    const data = this.readFile()
    yield 33.33 // 33.33% progress
    const parsedData = this.path.endsWith('.json') ? this.parseJson(data) : this.parseYaml(data)
    yield 66.66 // 66.66% progress
    this.collection = this.parseCollection(parsedData)
    yield 100 // 100% progress
  }

  public getCollection(): Collection {
    if (!this.collection) {
      throw new Error('collection is undefined')
    }
    return this.collection
  }
}

export default CollectionImporter
