import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { folderRoutes } from './modules/folder/folder.controller'
import { swagger } from '@elysiajs/swagger'

export const app = new Elysia()
  .use(cors({ origin: ['http://localhost:5173'] }))
  .use(swagger({
    path: '/docs',
    documentation: {
      info: { title: 'Explorer API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3002' }]
    }
  }))
  .group('/v1', (app) => app.use(folderRoutes))
