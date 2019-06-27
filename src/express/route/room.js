const express = require('express')
const router = express.Router()
const Room = require('../../mongoose/model/room')

router.post(
    '/createNewRoom',
    async (req, res) => {
        const room = Room(
            {
                name: 'room one',
                members: [
                    {
                        user: '5d146e36db19ff2ea01f8eca'
                    },
                    {
                        user: '5d146e3edb19ff2ea01f8ecd'
                    },
                    {
                        user: '5d146e44db19ff2ea01f8ed1'
                    }
                ]
            }
        )
        await room.save()
        res.send()
    }
)

module.exports = router