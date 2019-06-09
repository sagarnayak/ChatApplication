const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelComeMail = (emailId, name) => {
    sgMail.send(
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
}

const sendForgotPasswordOTP = (emailId, otp) => {
    sgMail.send(
        {
            to: emailId,
            from: 'snkumar.nayak@gmail.com',
            subject: 'Reset Password',
            text:
                `Hi
                The otp to reset your password is ${otp}
            `
        }
    )
}

module.exports = {
    sendWelComeMail,
    sendForgotPasswordOTP
}