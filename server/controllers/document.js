const { NotBeforeError } = require('jsonwebtoken')
const Document = require('../models/document')

const getAllDocuments = async (req, res) => {
  try {
    const allDocs = await Document.find({})
    const ownDocs = await Document.find({ owner: req.user._id })
    let collabDocs = allDocs.filter((doc) => {
      if (doc.collaborators.includes(req.user._id)) {
        return true
      }
      return false
    })

    const docs = [...ownDocs, ...collabDocs]
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const doesDocumentExist = async (req, res, next) => {
  try {
    const name = await Document.findOne({
      title: req.body.title,
      owner: req.user._id
    })
    if (name) {
      return res.status(404).json({
        status: 'error',
        message: 'Document already exists! 😅'
      })
    }
    next()
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const createDocument = async (req, res) => {
  try {
    const doc = new Document({
      title: req.body.title,
      owner: req.user._id
    })
    await doc.save()
    res.status(201).json({
      status: 'success',
      data: doc
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! 😅'
      })
    }
    res.status(200).json({
      status: 'success',
      data: doc
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const getAllDocumentsPopulated = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate({
      path: 'collaborators',
      select: 'username'
    })
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! 😅'
      })
    }
    res.status(200).json({
      status: 'success',
      data: doc
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! 😅'
      })
    }
    res.status(200).json({
      status: 'success',
      data: doc
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id)
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! 😅'
      })
    }
    res.status(200).json({
      status: 'success',
      message: 'Document deleted! 🕺',
      data: null
    })
  } catch (error) {
    res.json({ status: 'error', message: error.message })
  }
}

module.exports = {
  getAllDocuments,
  doesDocumentExist,
  createDocument,
  getDocument,
  getAllDocumentsPopulated,
  updateDocument,
  deleteDocument
}
