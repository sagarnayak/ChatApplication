const express = require('express')
const router = express.Router()
const User = require('../../mongoose/model/user')
const multer = require('multer')
const upload = multer()

router.post(
    '/signup',
    async (req, res) => {
        try {
            const user = await new User(req.body).save()
            User.staticFunction()
            res.send(user)
        } catch (error) {
            res.status(400)
                .send(error)
        }
    }
)

router.patch(
    '/user/avatar',
    upload.single('avatar'),
    async (req, res) => {
        const avatar = req.file
        if (!avatar) {
            res.status(400).send('please upload a avatar')
            return
        }
        console.log('the id is ' + req.body.userId)
        res.send('here')
    }
)

module.exports = router