import { folderRepo, type FileRecord } from './folder.repo'
import { mkdir } from 'fs/promises'

const toLite = (f: any) => ({
  id: f.id,
  name: f.name,
  hasChildren: (f._count?.children ?? 0) > 0
})

export const folderService = {
  async rootsLite() {
    const rows = await folderRepo.roots()
    return rows.map(toLite)
  },

  async childrenLite(parentId: string, limit: number, cursor?: string) {
    const rows = await folderRepo.childrenPaged(parentId, limit, cursor)
    const items = rows.map(toLite)
    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null
    return { items, nextCursor }
  },

  async files(
    folderId: string,
    limit: number,
    cursor?: string
  ): Promise<{ items: FileRecord[]; nextCursor: string | null }> {
    const rows = await folderRepo.filesPaged(folderId, limit, cursor)
    const nextCursor = rows.length === limit ? rows[rows.length - 1]?.id ?? null : null
    return { items: rows, nextCursor }
  },

  detail(id: string) {
    return folderRepo.byId(id)
  },

  create(name: string, parentId?: string | null) {
    return folderRepo.create(name, parentId)
  },
  rename(id: string, name: string) {
    return folderRepo.rename(id, name)
  },
  remove(id: string) {
    return folderRepo.remove(id)
  },
  async addFile(folderId: string, file: globalThis.File): Promise<FileRecord> {
    await mkdir('uploads', { recursive: true })
    await Bun.write(`uploads/${file.name}`, file)
    return folderRepo.addFile(folderId, file.name)
  },
}
