const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
	username: {
		type: String,
		required: [true, "Username is required!"],
		unique: [true, "Username is already taken! Sorry 😅"]
	},
	email: {
		type: String,
		required: [true, "Email is required!"],
		unique: [true, "Email is already taken! Sorry 😅"],
	},
	password: {
		type: String,
		required: [true, "Password is required!"],
		minlength: [8, "Password must be at least 8 characters long!"],
		select: false
	}
})

userSchema.pre('save', async function(next) {
	try {
		if (!this.isModified('password')) return next()
	
		const rounds = process.env.NODE_ENV === 'test' ? 1 : 12
		const hash = await bcrypt.hash(this.password, rounds)
		this.password = hash;
	
		return next()
	 } catch (error) {
		return next(error)
	 }
})

userSchema.methods.comparePassword = async function(candidatePassword, password) {
	const isMatch = await bcrypt.compare(candidatePassword, password)
	return isMatch
}

userSchema.methods.isPasswordChanged = (timestamp) => {
	const changedAt = this.passwordChangedAt
	if (!changedAt) return false
	const changedAgo = Date.now() - changedAt
	return changedAgo < timestamp
}

userSchema.methods.toJSON = function() {
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	return userObject
}

module.exports = model('User', userSchema)
