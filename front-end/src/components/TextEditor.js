import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import '../styles/editor.scss'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SAVE_INTERVAL = 2000
const TOOLBAR_OPTIONS = [
	[{ header: [1, 2, 3, 4, 5, 6, false] }],
	[{ font: [] }],
	[{ list: 'ordered' }, { list: 'bullet' }],
	['bold', 'italic', 'underline'],
	[{ script: 'sub' }, { script: 'super' }],
	[{ align: [] }],
	['image', 'blockquote', 'code-block'],
	['clean'],
]

const TextEditor = () => {
	const { id: docId } = useParams()
	const [socket, setSocket] = useState()
	const [quill, setQuill] = useState()

	useEffect(() => {
		const s = io('http://localhost:5000')
		setSocket(s)
		return () => {
			s.disconnect()
		}
	}, [])

	useEffect(() => {
		if (socket == null || quill == null) return
		const handler = (delta) => {
			quill.updateContents(delta)
		}
		socket.on('recieve-changes', handler)

		return () => {
			socket.off('recieve-changes', handler)
		}
	}, [quill, socket])

	useEffect(() => {
		if (socket == null || quill == null) return
		const handler = (delta, oldDelta, source) => {
			if (source !== 'user') return
			socket.emit('send-changes', delta)
		}
		quill.on('text-change', handler)

		return () => {
			quill.off('text-change', handler)
		}
	}, [quill, socket])

	useEffect(() => {
		if (socket == null || quill == null) return

		socket.once('load-document', (document) => {
			quill.setContents(document)
			quill.enable()
		})

		socket.emit('get-document', docId)
	}, [socket, quill, docId])

	useEffect(() => {
		if (socket == null || quill == null) return

		const interval = setInterval(() => {
			socket.emit('save-document', quill.getContents())
		}, SAVE_INTERVAL)

		return () => {
			clearInterval(interval)
		}
	}, [socket, quill, docId])

	const wrapperRef = useCallback((wrapper) => {
		if (wrapper == null) return

		wrapper.innerHTML = ''
		const editor = document.createElement('div')
		wrapper.append(editor)
		const q = new Quill(editor, {
			theme: 'snow',
			modules: { toolbar: TOOLBAR_OPTIONS },
		})
		q.disable()
		q.setText('Loading...')
		setQuill(q)
	}, [])

	return <div className='container' ref={wrapperRef}></div>
}

export default TextEditor
