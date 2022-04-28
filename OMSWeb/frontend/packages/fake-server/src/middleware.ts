import { Application, Request, Response, NextFunction, RequestHandler } from 'express'
import jsonServer from 'json-server'
import path from 'path'
import bodyParser from 'body-parser'
import { routerList } from './routers'

const server2 = jsonServer.create()
const middlewares = jsonServer.defaults()
const router = jsonServer.router(path.join(__dirname, '..', 'db.json'))

server2.use(middlewares)
server2.use(bodyParser.json() as RequestHandler)

server2.get('/hello', (req: Request, res: Response) => {
  res.send('API works')
})

routerList.forEach((_router) => {
  server2.use('/api/v1', _router)
})
server2.use(router)


server2.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Continue to JSON Server router
  next()
})

export const server = server2
