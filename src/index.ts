import { openDB } from 'idb'

const HASH = 'hash'
const CONTENT = 'content'

class LazyCache {
  dbPromise: ReturnType<typeof openDB>

  constructor (name: string) {
    this.dbPromise = openDB(name, 1, {
      upgrade (db) {
        db.createObjectStore(HASH)
        db.createObjectStore(CONTENT)
      }
    })
  }

  async getDB () {
    return this.dbPromise.catch(() => undefined) // not available in Firefox Private Browsing
  }

  async get (key: string, hash: string, url: string): Promise<ArrayBuffer> {
    const db = await this.getDB()
    const storedHash: string | undefined = await db?.get(HASH, key)
    if (storedHash === hash) {
      return db!.get(CONTENT, key)
    }
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Fail to download ${key}`)
    }
    const buffer = await response.arrayBuffer()
    await db?.put(CONTENT, buffer, key)
    await db?.put(HASH, hash, key)
    return buffer
  }
}

export {
  HASH,
  CONTENT,
  LazyCache
}
