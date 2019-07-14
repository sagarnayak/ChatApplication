const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Room = require('../../mongoose/model/room')
const { createGenericError } = require('../../util/errorMaster')

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
                    name: RegExp(req.query.containing, 'i')
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
    '/getRoom/:roomId',
    auth,
    async (req, res) => {
        try {
            if (req.params.roomId) {
                const room = await Room.findOne(
                    {
                        _id: req.params.roomId
                    }
                )
                if (room) {
                    await room.populate(
                        {
                            path: 'users'
                        }
                    ).execPopulate()
                    res.send(room)
                } else {
                    res.status(400).send()
                }
            } else {
                res.status(400).send()
            }
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    }
)

router.post(
    '/createRoom',
    auth,
    async (req, res) => {
        try {
            if (
                req.body.name &&
                req.body.members
            ) {
                const membersArray = []
                const alreadyAddedMembers = []
                membersArray.push(
                    {
                        user: req.user._id.toString()
                    }
                )
                alreadyAddedMembers.push(req.user._id.toString())
                req.body.members.forEach(
                    (id) => {
                        if (
                            !alreadyAddedMembers.includes(id)
                        ) {
                            membersArray.push(
                                {
                                    user: id
                                }
                            )
                            alreadyAddedMembers.push(id)
                        }
                    }
                )
                const room = Room(
                    {
                        name: req.body.name,
                        members: membersArray,
                        admin: req.user._id
                    }
                )
                await room.save()
                res.send()
            } else {
                res.status(400).send()
            }
        } catch (error) {
            res.status(400).send()
        }
    }
)

router.get(
    '/leaveRoom/:roomId',
    auth,
    async (req, res) => {
        try {
            const room = await Room.findOne({ _id: req.params.roomId })

            if (!room)
                return res.status(400).send()

            room.members = room.members.filter(
                (user) => {
                    if (
                        user.user.toString() === req.user._id.toString()
                    ) {
                        return false
                    }
                    return true
                }
            )

            await room.save()

            res.send()
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    }
)

router.post(
    '/joinRoom',
    auth,
    async (req, res) => {
        try {
            if (!req.body.roomId)
                return res.status(400).send(createGenericError('Provide a room id'))

            const room = await Room.findOne({ _id: req.body.roomId })

            if (!room)
                return res.status(400).send(createGenericError('Room not found'))

            room.members.push(
                {
                    user: req.user._id
                }
            )

            await room.save()

            await room.populate({
                path: 'users'
            }).execPopulate()

            res.send(room)
        } catch (error) {
            console.log(error)
            res.status(400).send()
        }
    }
)

module.exports = router