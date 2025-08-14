import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
const app = new Elysia()
  .use(cors({ origin: ['http://localhost:5173'] }))

// GET all folders (flat) – buat kebutuhan lain
app.get('/folders', () => prisma.folder.findMany())

// GET detail + children + files
app.get('/folders/:id', ({ params }) =>
  prisma.folder.findUnique({
    where: { id: params.id },
    include: { children: true, files: true }
  })
)

// GET tree sekali query (bangun nested di memori)
app.get('/tree', async () => {
  const all = await prisma.folder.findMany()
  const byParent: Record<string, any[]> = {}
  all.forEach((f: any) => {
    const key = f.parentId ?? 'root'
    ;(byParent[key] ??= []).push({ ...f, children: [] })
  })
  const index: Record<string, any> = {}
  ;(byParent['root'] ?? []).forEach((n: any) => index[n.id] = n)
  all.forEach((f: any) => (index[f.id] ??= { ...f, children: [] }))

  all.forEach((f: any) => {
    if (f.parentId) {
      const parent = index[f.parentId]
      const node   = index[f.id]
      parent?.children?.push(node)
    }
  })
  return byParent['root'] ?? []
})

app.listen(3002)
console.log('Backend running on http://localhost:3002')
