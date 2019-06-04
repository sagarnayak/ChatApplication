const mongoose = require('mongoose')

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
        }
    },
    {
        timestamps: true
    }
)

UserSchema.pre(
    'save',
    function (next) {
        console.log('on save hook')
        next()
    }
)

const User = mongoose.model(
    'User', UserSchema
)

module.exports = User