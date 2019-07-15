const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
    readAllNotificationForRoomNotification
} = require('../../firebase/cloudMessage')

router.post(
    '/readAllNotification',
    auth,
    async (req, res) => {
        try {
            if (req.body.roomId) {
                const fcmIds = []
                req.user.tokens.forEach(
                    (token) => {
                        if (token.fcmToken)
                            fcmIds.push(token.fcmToken)
                    }
                )
                readAllNotificationForRoomNotification(
                    fcmIds,
                    req.body.roomId
                )
            } else {
                res.status(400).send()
            }
        } catch (err) {
            res.status(400).send()
        }
    }
)
module.exports = router