const FCM = require('fcm-node')

const fcm = new FCM(
    {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    }
)

const sendAvatarUpdatedNotification = (user, tokenToExclude) => {
    user.tokens.forEach(
        (token) => {
            if (token.fcmToken && token.token !== tokenToExclude) {
                const message = {
                    to: token.fcmToken,
                    data: {
                        operationType: 'AvatarUpdated'
                    }
                }
                console.log(message)

                fcm.send(message,
                    function (err, response) {
                        if (err) {
                            console.log("Something has gone wrong! " + err)
                        } else {
                            console.log("Successfully sent with response: ", response)
                        }
                    })
            }
        }
    )
}

const sendPingBackNotification = (user, tokenToExclude) => {
    user.tokens.forEach(
        (token) => {
            if (token.fcmToken && token.token !== tokenToExclude) {
                const message = {
                    to: token.fcmToken,
                    data: {
                        operationType: 'PingBack'
                    }
                }

                fcm.send(message,
                    function (err, response) {
                        if (err) {
                            console.log("Something has gone wrong!" + err)
                        } else {
                            console.log("Successfully sent with response: ", response)
                        }
                    })
            }
        }
    )
}

module.exports = {
    sendAvatarUpdatedNotification,
    sendPingBackNotification
}