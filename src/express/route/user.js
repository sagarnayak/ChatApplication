const express = require('express')
const router = express.Router()
const User = require('../../mongoose/model/user')

router.post(
    '/signup',
    (req, res) => {
        const user = new User(
            {
                name: 'sagar',
                age: 25
            }
        ).save()
        res.send(user)
    }
)

module.exports = router