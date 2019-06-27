const mongoose = require('mongoose')

const RoomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

RoomSchema.virtual('chats', {
    ref: 'Chat',
    localField: '_id',
    foreignField: 'room'
})

const Room = mongoose.model('Room', RoomSchema)

module.exports = Room