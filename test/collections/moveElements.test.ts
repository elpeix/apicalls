import { describe, expect, it } from 'vitest'
import { moveElements } from '../../src/renderer/src/lib/moveElements'
import { getFolder, getRequest } from '../data/data'

describe('Move collections', () => {
  it('should do nothing if elements are empty', () => {
    const elements: (CollectionFolder | RequestType)[] = []
    const from: PathItem[] = []
    const to: PathItem[] = []
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
  })

  it('should do nothing if elements has only one element', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1')]
    const from: PathItem[] = []
    const to: PathItem[] = []
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
  })

  it('should do nothing if from is empty', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1'), getRequest('2')]
    const from: PathItem[] = []
    const to: PathItem[] = []
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
  })

  it('should do nothing if from and to are equal', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1'), getFolder('2')]
    const from: PathItem[] = [{ id: '1', type: 'request' }]
    const to: PathItem[] = [{ id: '1', type: 'request' }]
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
  })

  it('should move element to the end', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1'), getFolder('2')]
    const from: PathItem[] = [{ id: '1', type: 'request' }]
    const to: PathItem[] = []
    const after = '2'
    const result = moveElements({ elements, from, to, after })
    expect(result.moved).toBe(true)
    expect(result.elements?.length).toBe(2)
    expect(result.elements?.[0].id).toBe('2')
    expect(result.elements?.[1].id).toBe('1')
  })

  it('should move element to up', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1'), getFolder('2')]
    const from: PathItem[] = [{ id: '2', type: 'request' }]
    const to: PathItem[] = [{ id: '1', type: 'folder' }]
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(true)
    expect(result.elements?.length).toBe(2)
    expect(result.elements?.[0].id).toBe('2')
    expect(result.elements?.[1].id).toBe('1')
  })

  it('should do nothing when move to same position in root', () => {
    const elements: (CollectionFolder | RequestType)[] = [
      getRequest('1'),
      getRequest('2'),
      getRequest('3')
    ]
    const from: PathItem[] = [{ id: '3', type: 'request' }]
    const to: PathItem[] = []
    const after: Identifier = '3'
    const result = moveElements({ elements, from, to, after })
    expect(result.moved).toBe(false)
    expect(result.elements?.length).toBe(3)
    expect(result.elements?.[0].id).toBe('1')
    expect(result.elements?.[1].id).toBe('2')
    expect(result.elements?.[2].id).toBe('3')
  })

  it('should do nothing when move to same position in folder', () => {
    const elements: (CollectionFolder | RequestType)[] = [
      getRequest('1'),
      getFolder('2', [getRequest('3'), getRequest('4'), getRequest('5')]),
      getRequest('6'),
      getRequest('7')
    ]
    const from: PathItem[] = [
      { id: '2', type: 'folder' },
      { id: '5', type: 'request' }
    ]
    const to: PathItem[] = [{ id: '2', type: 'folder' }]
    const after: Identifier = '5'
    const result = moveElements({ elements, from, to, after })
    expect(result.moved).toBe(false)
    expect(result.elements?.length).toBe(4)
    expect(result.elements?.[0].id).toBe('1')
    expect(result.elements?.[1].id).toBe('2')
    expect(result.elements?.[2].id).toBe('6')
    expect(result.elements?.[3].id).toBe('7')

    const folder = result.elements?.[1] as CollectionFolder
    expect(folder.elements?.length).toBe(3)
    expect(folder.elements?.[0].id).toBe('3')
    expect(folder.elements?.[1].id).toBe('4')
    expect(folder.elements?.[2].id).toBe('5')
  })

  it('should move element to down', () => {
    const elements: (CollectionFolder | RequestType)[] = [
      getRequest('1'),
      getFolder('2'),
      getRequest('3')
    ]
    const from: PathItem[] = [{ id: '1', type: 'request' }]
    const to: PathItem[] = []
    const after: Identifier = '2'
    const result = moveElements({ elements, from, to, after })
    expect(result.moved).toBe(true)
    expect(result.elements?.length).toBe(3)
    expect(result.elements?.[0].id).toBe('2')
    expect(result.elements?.[1].id).toBe('1')
    expect(result.elements?.[2].id).toBe('3')
  })

  it('should move element to folder', () => {
    const elements: (CollectionFolder | RequestType)[] = [getRequest('1'), getFolder('2')]
    const from: PathItem[] = [{ id: '1', type: 'request' }]
    const to: PathItem[] = [{ id: '2', type: 'collection' }]
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(true)
    expect(result.elements?.length).toBe(1)
    expect(result.elements?.[0].id).toBe('2')
    expect(result.elements?.[0].type).toBe('folder')
    const folder = result.elements?.[0] as CollectionFolder
    expect(folder.elements.length).toBe(1)
    expect(folder.elements[0].id).toBe('1')
  })

  it('should do nothing if element is already in the folder', () => {
    const folder = getFolder('2', [getRequest('1')])
    const elements: (CollectionFolder | RequestType)[] = [folder]
    const from: PathItem[] = [{ id: '1', type: 'request' }]
    const to: PathItem[] = [{ id: '2', type: 'collection' }]
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
    expect(result.elements?.length).toBe(1)
    expect(result.elements?.[0].id).toBe('2')
    expect(result.elements?.[0].type).toBe('folder')
    const resultFolder = result.elements?.[0] as CollectionFolder
    expect(resultFolder.elements.length).toBe(1)
    expect(resultFolder.elements[0].id).toBe('1')
  })

  it('should move element in the folder between other elements', () => {
    const elements: (CollectionFolder | RequestType)[] = [
      getFolder('2', [getRequest('1'), getRequest('3')]),
      getRequest('4')
    ]
    const from: PathItem[] = [{ id: '4', type: 'request' }]
    const to: PathItem[] = [{ id: '2', type: 'folder' }]
    const after: Identifier = '1'

    const result = moveElements({ elements, from, to, after })
    expect(result.moved).toBe(true)
    expect(result.elements?.length).toBe(1)
    expect(result.elements?.[0].id).toBe('2')
    const resultFolder = result.elements?.[0] as CollectionFolder
    expect(resultFolder.elements.length).toBe(3)
    expect(resultFolder.elements[0].id).toBe('1')
    expect(resultFolder.elements[1].id).toBe('4')
    expect(resultFolder.elements[2].id).toBe('3')
  })

  it('should do nothing if folder is moved to its child', () => {
    const folder = getFolder('001', [getFolder('002')])
    const elements: (CollectionFolder | RequestType)[] = [folder]
    const from: PathItem[] = [{ id: '001', type: 'folder' }]
    const to: PathItem[] = [
      { id: '001', type: 'folder' },
      { id: '002', type: 'collection' }
    ]
    const result = moveElements({ elements, from, to })
    expect(result.moved).toBe(false)
  })
})
