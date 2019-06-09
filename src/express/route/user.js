const express = require('express')
const router = express.Router()
const User = require('../../mongoose/model/user')
const Otp = require('../../mongoose/model/otp')
const { sendWelComeMail, sendForgotPasswordOTP } = require('../../sgMail/emailClient')
const auth = require('../middleware/auth')
const validator = require('validator')
const multer = require('multer')
const upload = multer(
    {
        limits: {
            fileSize: 1000000
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)/))
                return cb(new Error('please upload a picture'))
        }
    }
)

router.post(
    '/signup',
    async (req, res) => {
        try {
            const user = await new User(req.body).save()
            const token = await user.generateAuthToken()
            sendWelComeMail(user.email, user.name)
            res.status(201).send({ user, token })
        } catch (error) {
            if (error.code === 11000)
                return res.status(400).send({ error: 'User with same email already exist.' })
            res.status(400).send(error)
        }
    }
)

router.get(
    '/forgotPassword/:emailId',
    async (req, res) => {
        try {
            const user = await User.findOne({ email: req.params.emailId })
            if (!user)
                throw new Error()

            const randomOtp = Math.floor(100000 + Math.random() * 900000)
            const otp = new Otp({ otp: randomOtp, requestedUser: user._id })
            await otp.save()
            sendForgotPasswordOTP(user.email, randomOtp)
            res.send('done sending the otp to mail')
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
)

router.post(
    '/resetPassword',
    async (req, res) => {
        try {
            const newPassword = req.body.newPassword
            const otp = req.body.otp
            if (!newPassword || !otp)
                return res.status(400).send({ error: 'provide otp and new password' })

            const otpFromDb = await Otp.findOne({ otp: otp })
            if (!otpFromDb || !otpFromDb.isValid()) {
                if (otpFromDb)
                    await otpFromDb.remove()
                return res.status(400).send({ error: 'OTP is not valid' })
            }

            const user = await User.findOne({ _id: otpFromDb.requestedUser })
            if (!user)
                return res.status(400).send({ error: 'OTP is not valid' })

            await user.updatePassword(newPassword)
            await otpFromDb.remove()
            res.send()
        } catch (error) {
            res.status(400).send({ error })
        }
    }
)

router.post(
    '/login',
    async (req, res) => {
        if (!req.body.email || !req.body.password || !validator.isEmail(req.body.email))
            return res.status(400).send({ error: 'email and password required.' })

        const user = await User.findOne({ email: req.body.email })
        if (!user)
            return res.status(401).send({ error: 'authentication failure' })

        const passwordMatched = await user.isPassword(req.body.password)
        if (!passwordMatched)
            return res.status(401).send({ error: 'authentication failure' })

        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
)

router.patch(
    '/updateAvatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        const avatar = req.file
        if (!avatar)
            return res.status(400).send('please upload a avatar')
        console.log('the id is ' + req.body.userId)
        res.send('here')
    },
    (error, req, res, next) => {
        res.status('400').send({ error: 'please upload a picture' })
    }
)

module.exports = router