const FCM = require('fcm-node')

const serverKey = require('../config/chatapplication-f40c4-firebase-adminsdk-42mrg-f1783c18e5.json')

console.log(serverKey)

const fcm = new FCM(process.env.FIREBASE_PRIVATE_KEY || serverKey)

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