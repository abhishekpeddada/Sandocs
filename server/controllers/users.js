const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const User = require('../models/user')
const Document = require('../models/document')

const authToken = (id) => {
  const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION
  })
  return token
}

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const newUser = new User({ username, email, password })
    await newUser.save()
    res.status(200).json({
      status: 'success',
      message: 'You have registered successfully 🥳',
      data: newUser
    })
  } catch (error) {
    let errMsg
    if (error.code == 11000) {
      errMsg = Object.keys(error.keyValue)[0] + ' is already taken! Sorry 😅'
    } else {
      errMsg = error.message
    }
    res.status(400).json({ status: 'error', message: errMsg })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      res.status(400).json({ status: 'error', message: 'User not found 😕' })
    } else if (!(await user.comparePassword(password, user.password))) {
      res
        .status(400)
        .json({ status: 'warning', message: 'Incorrect password ⚠️' })
    }

    const token = authToken(user._id)
    res.cookie('token', token, {
      expires: new Date(
        Date.now() + process.env.TOKEN_EXPIRATION * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    })
    res.status(200).json({
      status: 'success',
      message: 'You have logged in successfully 🥳',
      token
    })
  } catch (error) {
    res
      .status(400)
      .json({ status: 'error', message: 'Error logging in', error })
  }
}

const logout = async (_req, res) => {
  try {
    res.cookie('token', '', {
      expires: new Date(Date.now() - 1000),
      httpOnly: true
    })
    res.status(200).json({
      status: 'success',
      message: 'You have logged out successfully 🥳'
    })
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message })
  }
}

const auth = async (req, res, next) => {
  try {
    let token = req.cookies.token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    } else if (!token) {
      return res
        .status(401)
        .json({ status: 'error', message: 'You are not logged in 🤔' })
    }
    const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user with this token no longer exists. 😕'
      })
    }

    const isPasswordChanged = await user.isPasswordChanged(decoded.iat)
    if (isPasswordChanged) {
      return res.status(401).json({
        status: 'error',
        message: 'Your password has been changed. Please login again!'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res
      .status(401)
      .json({ status: 'error', message: 'You are not logged in 🤔', error })
  }
}

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res
      .status(200)
      .json({ status: 'success', message: 'User found 🥳', data: user })
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message })
  }
}

const isLoggedIn = async (req, res) => {
  try {
    const token = req.cookies.token
    if (token) {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.TOKEN_SECRET
      )
      const user = await User.findById(decoded.id)
      if (!user) {
        return res.status(401).json({
          status: 'error',
          loggedIn: false
        })
      }

      const isPasswordChanged = await user.isPasswordChanged(decoded.iat)

      if (isPasswordChanged) {
        return res.status(401).json({
          status: 'error',
          loggedIn: false
        })
      }
      return res.status(200).json({
        status: 'success',
        loggedIn: true,
        user
      })
    } else {
      return res.status(401).json({
        status: 'error',
        loggedIn: false
      })
    }
  } catch (error) {
    res.status(400).json(false)
  }
}

const getOwner = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      })
    }
    return res.status(200).json({
      status: 'success',
      owner: document.owner
    })
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

const isOwner = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! ⚠️'
      })
    }
    if (!req.user._id.equals(document.owner)) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not the owner of this document!'
      })
    }
    next()
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

const isOwnerOrCollaborator = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! ⚠️'
      })
    }
    if (
      !req.user._id.equals(document.owner) &&
      !document.collaborators.includes(req.user._id)
    ) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not the owner or a collaborator of this document!'
      })
    }
    next()
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

const removeCollaborator = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      })
    }
    if (!document.collaborators) {
      return res.status(200).json({
        status: 'error',
        message: 'No collaborators to remove'
      })
    }
    let collaborators = [...document.collaborators]
    const index = collaborators.findIndex((id) => id.equals(req.body.collabId))
    if (index === -1) {
      return res.status(400).json({
        status: 'error',
        message: 'Collaborator not found'
      })
    }
    collaborators.splice(index, 1)
    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        collaborators: collaborators
      },
      { new: true }
    )
    return res.status(200).json({
      status: 'success',
      message: 'Collaborator removed',
      data: updatedDoc
    })
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

const acceptCollaborator = async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId)
    const user = await User.findById(req.body.senderId)

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found! ⚠️'
      })
    }
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found! 😕'
      })
    }
    if (user_id.equals(document.owner)) {
      return res.status(400).json({
        status: 'error',
        message: 'You are the owner of this document! 🤔'
      })
    }
    if (document.collaborators.includes(user._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a collaborator! 🤔'
      })
    }
    const newCollaborators = [...document.collaborators, user._id]
    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.docId,
      {
        collaborators: newCollaborators
      },
      { new: true }
    )
    return res.status(200).json({
      status: 'success',
      message: 'Collaborator added',
      data: updatedDoc
    })
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = {
  register,
  login,
  logout,
  auth,
  getUser,
  isLoggedIn,
  getOwner,
  isOwner,
  isOwnerOrCollaborator,
  removeCollaborator,
  acceptCollaborator
}
