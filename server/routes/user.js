const router = require('express').Router()
const {
  register,
  login,
  logout,
  auth,
  getUser
} = require('../controllers/users')

router.post('/register', register)

router.post('/login', login)

router.get('/logout', logout)

// router.get('/isLoggedIn', isLoggedIn)

router.get('/', auth, getUser)

module.exports = router
