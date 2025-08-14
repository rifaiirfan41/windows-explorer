import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const folderRepo = {
  roots: () =>
    prisma.folder.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { children: true } } }
    }),

  // children paginated
  childrenPaged: (parentId: string, limit: number, cursor?: string) =>
    prisma.folder.findMany({
      where: { parentId },
      orderBy: { id: 'asc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { _count: { select: { children: true } } }
    }),

  byId: (id: string) =>
    prisma.folder.findUnique({
      where: { id },
      include: { children: true, files: true }
    }),

  filesPaged: (folderId: string, limit: number, cursor?: string) =>
    prisma.file.findMany({
      where: { folderId },
      orderBy: { id: 'asc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    }),

  create: (name: string, parentId?: string | null) =>
    prisma.folder.create({ data: { name, parentId: parentId ?? null } }),

  rename: (id: string, name: string) =>
    prisma.folder.update({ where: { id }, data: { name } }),

  remove: async (id: string) => {
    await prisma.file.deleteMany({ where: { folderId: id } })
    await prisma.folder.deleteMany({ where: { parentId: id } })
    return prisma.folder.delete({ where: { id } })
  }

}
