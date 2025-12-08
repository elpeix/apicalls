import { describe, expect, it } from 'vitest'
import { addFolderToCollection } from '../../../src/renderer/src/lib/collectionUtils'

describe('addFolderToCollection', () => {
  const createFolder = (id: number | string, name: string): CollectionFolder => ({
    id,
    type: 'folder',
    name,
    elements: []
  })

  it('should add folder to root', () => {
    const collection: Collection = {
      id: 1,
      name: 'Collection',
      elements: []
    }
    const newFolder = createFolder(2, 'New Folder')
    const result = addFolderToCollection(collection, [], newFolder)

    expect(result.elements).toHaveLength(1)
    expect(result.elements[0]).toEqual(newFolder)
  })

  it('should add folder to nested folder', () => {
    const nestedFolder = createFolder(2, 'Parent Folder')
    const collection: Collection = {
      id: 1,
      name: 'Collection',
      elements: [nestedFolder]
    }
    const newFolder = createFolder(3, 'Child Folder')
    const result = addFolderToCollection(collection, [{ id: 2, type: 'folder' }], newFolder)

    expect(result.elements).toHaveLength(1)
    expect((result.elements[0] as CollectionFolder).elements).toHaveLength(1)
    expect((result.elements[0] as CollectionFolder).elements[0]).toEqual(newFolder)
  })

  it('should add folder to nested folder deeper', () => {
    const nestedFolder2 = createFolder(3, 'Parent Folder 2')
    const nestedFolder1 = createFolder(2, 'Parent Folder 1')
    nestedFolder1.elements = [nestedFolder2]

    const collection: Collection = {
      id: 1,
      name: 'Collection',
      elements: [nestedFolder1]
    }
    const newFolder = createFolder(4, 'Child Folder')
    const result = addFolderToCollection(
      collection,
      [
        { id: 2, type: 'folder' },
        { id: 3, type: 'folder' }
      ],
      newFolder
    )

    expect(result.elements).toHaveLength(1)
    const folder1 = result.elements[0] as CollectionFolder
    expect(folder1.id).toBe(2)
    expect(folder1.elements).toHaveLength(1)

    const folder2 = folder1.elements[0] as CollectionFolder
    expect(folder2.id).toBe(3)
    expect(folder2.elements).toHaveLength(1)
    expect(folder2.elements[0]).toEqual(newFolder)
  })

  it('should insert after specific id', () => {
    const existingFolder = createFolder(2, 'Existing')
    const collection: Collection = {
      id: 1,
      name: 'Collection',
      elements: [existingFolder]
    }
    const newFolder = createFolder(3, 'New Folder')
    const result = addFolderToCollection(collection, [], newFolder, 2)

    expect(result.elements).toHaveLength(2)
    expect(result.elements[0]).toEqual(existingFolder)
    expect(result.elements[1]).toEqual(newFolder)
  })
})
