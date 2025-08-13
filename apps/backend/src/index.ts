import { Elysia } from 'elysia';
// import { PrismaClient } from '@prisma/client';
import cors from '@elysiajs/cors';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = new Elysia()
  .use(cors())
  .get('/folders', async () => {
    return prisma.folder.findMany({ include: { children: true } });
  })
  .get('/folders/:id', async ({ params }) => {
    return prisma.folder.findUnique({
      where: { id: params.id },
      include: { children: true, files: true }
    });
  });

app.listen(3002);
console.log('Backend running on http://localhost:3002');
