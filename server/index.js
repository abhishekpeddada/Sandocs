const mongoose = require('mongoose')
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const userRouter = require('./routes/user')
const documentRouter = require('./routes/document')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

const result = dotenv.config()

if (result.error) {
  throw result.error
}

// const port = process.env.PORT || 5000
// const io = require('socket.io')(port, {
// 	cors: {
// 		origin: 'http://localhost:3000',
// 		methods: ['GET', 'POST'],
// 	},
// })

const uri = process.env.MONGO_URI

mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connection is established successfully 🎉'))
  .catch((err) => console.log(err))

// const defaultValue = ''

// io.on('connection', (socket) => {
// 	socket.on('get-document', async (docId) => {
// 		const data = await findCreateDocument(docId)
// 		socket.join(docId)
// 		socket.emit('load-document', data)

// 		socket.on('send-changes', (delta) => {
// 			socket.broadcast.to(docId).emit('recieve-changes', delta)
// 		})

// 		socket.on('save-document', async (data) => {
// 			await Document.findByIdAndUpdate(docId, { data })
// 		})
// 	})
// })

// async function findCreateDocument(id) {
// 	if (id == null) return

// 	const document = await Document.findById(id)
// 	if (document) return document

// 	return await Document.create({ _id: id, data: defaultValue })
// }

app.use('/user', userRouter)
app.use('/docs', documentRouter)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server is running on port ${port} 🚀`))
