const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate(email) {
                if (!validator.isEmail(email))
                    throw new Error('Please provide valid email.')
            }
        },
        age: {
            type: Number,
            required: true,
            min: 1
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ],
        avatar: {
            type: Buffer
        }
    },
    {
        timestamps: true
    }
)

UserSchema.pre(
    'save',
    async function (next) {
        const user = this
        if (user.isModified('password')) {
            user.password = await bcrypt.hash(
                user.password, 8
            )
        }
        next()
    }
)

UserSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.createdAt
    delete user.updatedAt
    delete user.__v
    return user
}

UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

UserSchema.methods.updatePassword = async function (password) {
    const user = this
    user.password = password
    await user.save()
}

UserSchema.methods.isPassword = async function (password) {
    const user = this
    try {
        const matched = await bcrypt.compare(password, user.password)
        if (matched)
            return true;
    } catch (error) {
        return false;
    }
}

UserSchema.statics.staticFunction = () => {
    console.log('static called')
}

const User = mongoose.model(
    'User', UserSchema
)

module.exports = User