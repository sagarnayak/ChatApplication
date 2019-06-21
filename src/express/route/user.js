const express = require('express')
const router = express.Router()
const User = require('../../mongoose/model/user')
const Otp = require('../../mongoose/model/otp')
const {
    sendWelComeMail,
    sendForgotPasswordOTP,
    sendGoodByeEmail,
    sendResetPaasswordEmail
} = require('../../sgMail/emailClient')
const auth = require('../middleware/auth')
const validator = require('validator')
const multer = require('multer')
const sharp = require('sharp')
const { createGenericError } = require('../../util/errorMaster')
const {
    sendAvatarUpdatedNotification,
    sendPingBackNotification
} = require('../../firebase/cloudMessage')

router.post(
    '/signup',
    async (req, res) => {
        try {
            const user = await new User(req.body).save()
            const token = await user.generateAuthToken()
            sendWelComeMail(user.email, user.name)
            res.status(201).send({ user, token })
        } catch (error) {
            if (error.name === 'ValidationError') {
                if (error.errors.name) {
                    return res.status(400).send(createGenericError(error.errors.name.message))
                }
                if (error.errors.email) {
                    return res.status(400).send(createGenericError(error.errors.email.message))
                }
                if (error.errors.age) {
                    return res.status(400).send(createGenericError(error.errors.age.message))
                }
                if (error.errors.password) {
                    return res.status(400).send(createGenericError(error.errors.password.message))
                }
            }
            if (error.code === 11000)
                return res.status(400).send(createGenericError('User with same email already exist.'))
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
                return res.status(400).send(createGenericError('Can not sed OTP the email'))

            const randomOtp = Math.floor(100000 + Math.random() * 900000)
            const otp = new Otp({ otp: randomOtp, requestedUser: user._id })
            await otp.save()
            sendForgotPasswordOTP(user.email, randomOtp)
            res.send('done sending the otp to mail')
        } catch (error) {
            console.log(error)
            res.status(400).send(createGenericError('Something went wrong.'))
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
                return res.status(400).send(createGenericError('provide otp and new password'))

            const otpFromDb = await Otp.findOne({ otp: otp })
            if (!otpFromDb || !otpFromDb.isValid()) {
                return res.status(400).send(createGenericError('OTP is not valid'))
            }

            const user = await User.findOne({ _id: otpFromDb.requestedUser })
            if (!user)
                return res.status(400).send(createGenericError('OTP is not valid'))

            try {
                await user.updatePassword(newPassword)
                await otpFromDb.remove()
                sendResetPaasswordEmail(user.email)
                res.send()
            } catch (error) {
                if (error.name === 'ValidationError' && error.errors.password) {
                    return res.status(400).send(createGenericError(error.errors.password.message))
                }
                res.status(400).send(error)
            }
        } catch (error) {
            res.status(400).send(error)
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
            return res.status(401).send(createGenericError('authentication failure'))

        const passwordMatched = await user.isPassword(req.body.password)
        if (!passwordMatched)
            return res.status(401).send(createGenericError('authentication failure'))

        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
)

router.post(
    '/logout',
    auth,
    async (req, res) => {
        try {
            const user = req.user
            user.tokens = user.tokens.filter(
                (token) => {
                    return token.token !== req.token
                }
            )
            await user.save()

            res.send()
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }
)

router.post(
    '/logoutAll',
    auth,
    async (req, res) => {
        try {
            const user = req.user

            sendPingBackNotification(req.user, req.token)

            user.tokens = []
            await user.save()

            res.send()
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }
)

router.patch(
    '/updateUser',
    auth,
    async (req, res) => {
        try {
            const fieldsToUpdate = Object.keys(req.body)
            const allowedUpdates = ['name', 'age']
            const isValidReq = fieldsToUpdate.every(
                (field) => {
                    return allowedUpdates.includes(field)
                }
            )
            if (!isValidReq)
                return res.status(400).send(createGenericError('only name age can be updated'))

            fieldsToUpdate.forEach(
                (field) => {
                    req.user[field] = req.body[field]
                }
            )
            try {
                await req.user.save()
                res.send()
            } catch (error) {
                if (error.name === 'ValidationError') {
                    if (error.errors.name)
                        return res.status(400).send(createGenericError(error.errors.name.message))
                    if (error.errors.age)
                        return res.status(400).send(createGenericError(error.errors.age.message))
                }
                res.status(400).send(error)
            }
        } catch (error) {
            res.status(400).send(error)
        }
    }
)

router.get(
    '/me',
    auth,
    (req, res) => {
        res.send(req.user)
    }
)

const upload = multer(
    {
        limits: {
            fileSize: 1000000
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
                return cb(new Error('please upload a picture'))

            cb(undefined, true)
        }
    }
)

router.patch(
    '/updateAvatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        try {
            const avatar = req.file
            if (!avatar)
                return res.status(400).send('please upload a avatar')
            const buffer = await sharp(avatar.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
            req.user.avatar = buffer
            await req.user.save()
            sendAvatarUpdatedNotification(
                req.user,
                req.token
            )
            res.send('updated your avatar on ' + req.get('host') + '/myAvatar')
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },
    (error, req, res, next) => {
        res.status(400).send(createGenericError('please upload a picture'))
    }
)

router.get(
    '/myAvatar',
    auth,
    (req, res) => {
        if (!req.user.avatar)
            return res.status(404).send()

        res.set('Content-Type', 'image/png').send(req.user.avatar)
    }
)

router.delete(
    '/removeMe',
    auth,
    async (req, res) => {
        try {
            sendGoodByeEmail(req.user.email, req.user.name)
            await req.user.remove()
            res.send()
        } catch (error) {
            res.status(400).send()
        }
    }
)

router.patch(
    '/updateFCMToken',
    auth,
    async (req, res) => {
        if (!req.body.fcmToken)
            res.status(400).send(createGenericError('Please provide fcm token'))
        try {
            let indexToUpdate = -1
            req.user.tokens.forEach(
                (token, index) => {
                    if (token.token === req.token) {
                        indexToUpdate = index
                    }
                }
            )
            if (indexToUpdate != -1) {
                req.user.tokens[indexToUpdate].fcmToken = req.body.fcmToken
                await req.user.save()
                res.send()
            } else {
                res.status(400).send(createGenericError('unable to update fcm token'))
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }
)

router.get(
    '/ping',
    auth,
    (req, res) => {
        res.send()
    }
)

router.get(
    '/avatarUpdateTimeStamp',
    auth,
    (req, res) => {
        if (!req.user.avatar)
            return res.status(404).send(createGenericError('Can not find your avatar'))

        res.send(
            {
                timeStamp: req.user.updatedAt
            }
        )
    }
)

module.exports = router