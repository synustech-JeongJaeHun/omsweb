import 'dotenv/config'
import { server } from './middleware'
import client from './dbconnection'


const PORT = 3000

// Add custom routes before JSON Server router
server.listen(PORT, () => {
  console.log(`JSON Server is running. port ${PORT}`)
})

