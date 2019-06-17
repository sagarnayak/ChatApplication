const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelComeMail = async (emailId, name) => {
    try {
        await sgMail.send(
            {
                to: emailId,
                from: 'snkumar.nayak@gmail.com',
                subject: 'Welcome to Chat',
                text:
                    `Hi ${name}
                Welcome to Chat Application. we are happy to have you here.
                `
            }
        )
    } catch (error) {
        console.log(error)
    }
}

const sendForgotPasswordOTP = async (emailId, otp) => {
    try {
        await sgMail.send(
            {
                to: emailId,
                from: 'snkumar.nayak@gmail.com',
                subject: 'Reset Password OTP',
                text:
                    `Hi
                The otp to reset your password is ${otp}. valid for ${process.env.OTP_VALIDITY_MIN} minutes
            `
            }
        )
    } catch (error) {
        console.log(error)
    }
}

const sendResetPaasswordEmail = async (emailId) => {
    try {
        await sgMail.send(
            {
                to: emailId,
                from: 'snkumar.nayak@gmail.com',
                subject: 'Reset Password',
                text:
                    `Hi
                Yoru password for chat application has been changed.
            `
            }
        )
    } catch (error) {
        console.log(error)
    }
}

const sendGoodByeEmail = async (emailId, name) => {
    try {
        await sgMail.send(
            {
                to: emailId,
                from: 'snkumar.nayak@gmail.com',
                subject: 'GoodBye ' + name,
                text:
                    `Hi
                We will miss you. please do let us know if we could have done anything to keep you with us.
            `
            }
        )
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    sendWelComeMail,
    sendForgotPasswordOTP,
    sendGoodByeEmail,
    sendResetPaasswordEmail
}