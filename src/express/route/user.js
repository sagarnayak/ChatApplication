const express = require('express')
const router = express.Router()
const User = require('../../mongoose/model/user')

router.post(
    '/signup',
    async (req, res) => {
        try {
            const user = await new User(req.body).save()
            user.testFunction()
            res.send(user)
        } catch (error) {
            res.status(400)
                .send(error)
        }
    }
)

module.exports = router