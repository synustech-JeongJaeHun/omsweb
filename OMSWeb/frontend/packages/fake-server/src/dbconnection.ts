import { Client } from 'pg'

const client = new Client({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT)
})

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('postgres connected')
  }
})

export const query = (text, params) => client.query(text, params)

export default client
