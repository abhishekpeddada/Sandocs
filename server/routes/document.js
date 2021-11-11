const router = require('express').Router()
const {
  auth,
  getOwner,
  isOwner,
  isOwnerOrCollaborator,
  removeCollaborator
} = require('../controllers/users')
const {
  getAllDocuments,
  doesDocumentExist,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getAllDocumentsPopulated
} = require('../controllers/document')

router.get('/', auth, getAllDocuments)

router.get('/:id', auth, isOwnerOrCollaborator, getDocument)

router.get('/populated/:id', auth, isOwner, getAllDocumentsPopulated)

router.post('/', auth, doesDocumentExist, createDocument)

router.patch(
  '/:id',
  auth,
  isOwnerOrCollaborator,
  doesDocumentExist,
  updateDocument
)

router.patch('/:id/collaborators', auth, isOwner, removeCollaborator)

router.delete('/:id', auth, isOwner, deleteDocument)

router.get('/owner/:docId', auth, getOwner)

module.exports = router
