import 'fake-indexeddb/auto'
import { it, expect } from 'vitest'
import { LazyCache } from '../src'

// @ts-ignore
globalThis.fetch = async (url: string) => ({
  ok: url.length > 0,
  arrayBuffer: async () => new ArrayBuffer(url.length)
})

it('IndexedDB', async () => {
  const lazyCache = new LazyCache('test')

  // network error
  expect(() => lazyCache.get('key', 'hash', '')).rejects.toThrow('Fail to download')

  // first load
  let buffer = await lazyCache.get('key', 'hash', '1')
  expect(buffer.byteLength).toEqual(1)

  // cache hit
  buffer = await lazyCache.get('key', 'hash', '22')
  expect(buffer.byteLength).toEqual(1)

  // cache miss
  buffer = await lazyCache.get('key', 'hsah', '333')
  expect(buffer.byteLength).toEqual(3)
})
