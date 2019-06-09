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

const Otp = mongoose.model('Otp', OtpSchema)

module.exports = Otp