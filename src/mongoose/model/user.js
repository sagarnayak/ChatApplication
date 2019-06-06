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
        },
        avatar: {
            data: Buffer,
            type: String
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
    return user
}

UserSchema.statics.staticFunction = () => {
    console.log('static called')
}

const User = mongoose.model(
    'User', UserSchema
)

module.exports = User