const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Room = require('../../mongoose/model/room')

router.get(
    '/getRooms',
    auth,
    async (req, res) => {
        let query
        if (
            req.query.containing &&
            req.query.limit &&
            req.query.skip
        ) {
            query = Room.find(
                {
                    name: RegExp(req.query.containing)
                }
            )
                .limit(
                    parseInt(req.query.limit)
                )
                .skip(
                    parseInt(req.query.skip)
                )
                .sort(
                    {
                        createdAt: 'desc'
                    }
                )
        } else if (
            req.query.limit &&
            req.query.skip
        ) {
            query = Room.find(
                {
                    'members.user': req.user._id
                }
            )
                .limit(
                    parseInt(req.query.limit)
                )
                .skip(
                    parseInt(req.query.skip)
                )
                .sort(
                    {
                        createdAt: 'desc'
                    }
                )
        } else {
            query = Room.find(
                {
                    'members.user': req.user._id
                }
            )
                .sort(
                    {
                        createdAt: 'desc'
                    }
                )
        }
        try {
            const rooms = await query.exec()
            if (
                rooms.length == 0
            ) {
                return res.status(204).send()
            }
            let allPromise = []
            rooms.forEach(
                async (room) => {
                    allPromise.push(
                        room.populate(
                            {
                                path: 'users'
                            }
                        ).execPopulate()
                    )
                }
            )
            Promise.all(allPromise)
                .then(
                    (result) => {
                        res.send(result)
                    }
                )
                .catch(
                    (error) => {
                        res.status(400).send()
                    }
                )
        } catch (error) {
            res.status(400).send()
        }
    }
)

router.get(
    '/createRoom',
    async (req, res) => {
        const room = Room(
            {
                name: 'room three',
                members: [
                    {
                        user: '5d19c10ad78cbc19041794af'
                    }
                ]
            }
        )
        await room.save()
        res.send()
    }
)

module.exports = router