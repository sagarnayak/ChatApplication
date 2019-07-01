const express = require('express')
const router = express.Router()
const Room = require('../../mongoose/model/room')
const router = express.Router()

router.get(
    '/getRooms',
    (req, res) => {

        res.send()
    }
)

module.exports = router