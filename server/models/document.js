const { Schema, model } = require('mongoose')

const docSchema = new Schema({
	title: {
    type: String,
    default: 'Untitled'
  },
  ownwer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  collaborators: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  content: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = model('Document', docSchema)
