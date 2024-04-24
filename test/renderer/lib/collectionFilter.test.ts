import { describe, it, expect } from 'vitest'
import { filterCollectionElements } from '../../../src/renderer/src/lib/collectionFilter'
import { getFolder, getRequest } from '../../data/data'

describe('Collection filter test', () => {
  it('should return an empty list if collection is empty', () => {
    const result = filterCollectionElements([], '')
    expect(result).toEqual([])
  })

  it('should return all elements if filter is empty', () => {
    const elements = [getRequest(1), getFolder(2, [getRequest(2)])]
    const result = filterCollectionElements(elements, '')
    expect(result).toEqual(elements)
  })

  it('should return filtered simple collection of requests', () => {
    const requestName = 'The Request'
    const elements = [getRequest(1, requestName), getRequest(2, 'Other')]
    const result = filterCollectionElements(elements, 'reque')
    expect(result).length(1)
    expect(result[0].name).toEqual(requestName)
  })

  it('should return filtered complex collection of folders and requests', () => {
    const elements = [
      getFolder(100, [
        getRequest(101, 'to filter'),
        getFolder(110, [getRequest(111, 'other filter'), getRequest(112, 'nops')]),
        getFolder(120, []),
        getFolder(130, [getRequest(131, 'no result')])
      ]),
      getRequest(1, 'filtering'),
      getFolder(200, [getRequest(201), getRequest(202)])
    ]
    const result = filterCollectionElements(elements, 'fil')
    expect(result).length(2)
    expect(result[1].id).toEqual(1)
    expect(result[0].type)
    const folder = result[0] as CollectionFolder
    expect(folder.id).toEqual(100)
    expect(folder.expanded).toEqual(true)
    expect(folder.elements).length(2)

    expect(elements).length(3)
    const firstFolder = elements[0] as CollectionFolder
    expect(firstFolder.id).toEqual(100)
    expect(firstFolder.elements).length(4)
  })
})
