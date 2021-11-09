require('dotenv').config()
const mongoose = require('mongoose')
const Document = require('./Document')

const port = process.env.PORT || 5000
const io = require('socket.io')(port, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
})

const uri = process.env.MONGO_URI
mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log('MongoDB connection is established successfully 🎉'))
	.catch((err) => console.log(err))

const defaultValue = ''

io.on('connection', (socket) => {
	socket.on('get-document', async (docId) => {
		const data = await findCreateDocument(docId)
		socket.join(docId)
		socket.emit('load-document', data)

		socket.on('send-changes', (delta) => {
			socket.broadcast.to(docId).emit('recieve-changes', delta)
		})

		socket.on('save-document', async (data) => {
			await Document.findByIdAndUpdate(docId, { data })
		})
	})
})

async function findCreateDocument(id) {
	if (id == null) return

	const document = await Document.findById(id)
	if (document) return document

	return await Document.create({ _id: id, data: defaultValue })
}
