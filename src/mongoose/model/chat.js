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
        },
        sentTo: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId
                }
            }
        ],
        sentToAll: {
            type: Boolean
        },
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId
                }
            }
        ],
        readByAll: {
            type: Boolean
        }
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

ChatSchema.virtual(
    'authorDetail',
    {
        ref: 'User',
        localField: 'author',
        foreignField: '_id',
        justOne: true
    }
)

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat