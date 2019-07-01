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
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

RoomSchema.virtual(
    'users',
    {
        ref: 'User',
        localField: 'members.user',
        foreignField: '_id'
    }
)

const Room = mongoose.model('Room', RoomSchema)

module.exports = Room