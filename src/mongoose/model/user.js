const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
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

const User = mongoose.model(
    'User', UserSchema
)

module.exports = User