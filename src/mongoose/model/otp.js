const mongoose = require('mongoose')

const OtpSchema = mongoose.Schema(
    {
        otp: {
            type: String,
            required: true
        },
        requestedUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        lifeTime: {
            type: Date,
            default: Date.now,
            expires: process.env.OTP_VALIDITY_MIN + 'm'
        }
    },
    {
        timestamps: true
    }
)

OtpSchema.methods.isValid = function () {
    const otp = this
    const createdTime = new Date(otp.createdAt).getTime()
    const timeNow = new Date().getTime()
    const diffInMin = Math.floor((timeNow - createdTime) / 1000 / 60)
    if (diffInMin < process.env.OTP_VALIDITY_MIN)
        return true
    return false
}

OtpSchema.statics.cleanUp = function () {
    console.log('otp cleanup started')
}

const Otp = mongoose.model('Otp', OtpSchema)

module.exports = Otp