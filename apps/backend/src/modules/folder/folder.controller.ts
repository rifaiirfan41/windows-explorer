import { Elysia, t } from 'elysia'
import { folderService } from './folder.service'

export const folderRoutes = new Elysia({ prefix: '/folders' })
  // GET /v1/folders/tree (roots only, lite)
  .get('/tree', () => folderService.rootsLite())

  // GET /v1/folders/:id/children?limit=20&cursor=xxx (lite)
  .get('/:id/children', ({ params, query }) =>
    folderService.childrenLite(params.id, Number(query.limit ?? 20), query.cursor as string | undefined),
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({ limit: t.Optional(t.Number()), cursor: t.Optional(t.String()) })
    }
  )

  // GET /v1/folders/:id/files?limit=&cursor=
  .get('/:id/files', ({ params, query }) =>
    folderService.files(params.id, Number(query.limit ?? 20), query.cursor as string | undefined),
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({ limit: t.Optional(t.Number()), cursor: t.Optional(t.String()) })
    }
  )

  // GET /v1/folders/:id (detail + eager children + files; utk panel kanan)
  .get('/:id', ({ params }) => folderService.detail(params.id), {
    params: t.Object({ id: t.String() })
  })

  .post('/', ({ body, set }) => {
    set.status = 201
    return folderService.create(body.name, body.parentId ?? null)
  }, {
    body: t.Object({
      name: t.String(),
      parentId: t.Optional(t.Nullable(t.String()))
    })
  })

  .patch('/:id', ({ params, body }) => folderService.rename(params.id, body.name), {
    params: t.Object({ id: t.String() }),
    body: t.Object({ name: t.String() })
  })

  .delete('/:id', ({ params }) => folderService.remove(params.id), {
    params: t.Object({ id: t.String() })
  })
