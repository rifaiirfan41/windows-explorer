import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Bersihin dulu
  await prisma.file.deleteMany()
  await prisma.folder.deleteMany()

  // Root folders
  const a = await prisma.folder.create({ data: { name: 'Folder A' } })
  const b = await prisma.folder.create({ data: { name: 'Folder B' } })

  // Children
  const a1 = await prisma.folder.create({ data: { name: 'Subfolder A1', parentId: a.id } })
  await prisma.folder.create({ data: { name: 'Subfolder A2', parentId: a.id } })
  await prisma.folder.create({ data: { name: 'Subfolder A1-1', parentId: a1.id } })
  await prisma.folder.create({ data: { name: 'Subfolder B1', parentId: b.id } })

  // Files (bonus)
  await prisma.file.createMany({
    data: [
      { name: 'readme.txt', folderId: a.id },
      { name: 'notes.md', folderId: a1.id }
    ]
  })
}
main().finally(() => prisma.$disconnect())
