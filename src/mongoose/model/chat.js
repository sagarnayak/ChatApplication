const mongoose = require('mongoose')

const ChatSchema = mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat