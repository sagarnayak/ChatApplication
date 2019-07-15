const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert(
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
    ),
    databaseURL: "https://chatapplication-f40c4.firebaseio.com"
});

const TOPIC_AVATAR_UPDATED = "avatarUpdated"

const sendAvatarUpdatedNotification = (user, tokenToExclude) => {
    user.tokens.forEach(
        (token) => {
            if (token.fcmToken && token.token !== tokenToExclude) {
                const message = {
                    token: token.fcmToken,
                    data: {
                        operationType: 'AvatarUpdated'
                    }
                }

                admin.messaging().send(message)
                    .then(
                        function (res) {
                        }
                    )
                    .catch(
                        function (err) {
                            console.log(err)
                        }
                    )
            }
        }
    )
}

const sendPingBackNotification = (user, tokenToExclude) => {
    user.tokens.forEach(
        (token) => {
            if (token.fcmToken && token.token !== tokenToExclude) {
                const message = {
                    token: token.fcmToken,
                    data: {
                        operationType: 'PingBack'
                    }
                }

                admin.messaging().send(message)
                    .then(
                        function (res) {
                        }
                    )
                    .catch(
                        function (err) {
                            console.log(err)
                        }
                    )
            }
        }
    )
}

const subscribeToAvatarUpdateTopic = (fcmIds) => {
    admin.messaging().subscribeToTopic(
        fcmIds,
        TOPIC_AVATAR_UPDATED
    )
        .then(function (response) {
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
        })
}

const unSubscribeToAvatarUpdateTopic = (fcmIds) => {
    admin.messaging().unsubscribeFromTopic(
        fcmIds,
        TOPIC_AVATAR_UPDATED
    )
        .then(function (response) {
        })
        .catch(function (error) {
            console.log('Error unsubscribing to topic:', error);
        })
}

const sendAvatarUpdatedForUserNotification = (userId) => {
    const message = {
        topic: TOPIC_AVATAR_UPDATED,
        data: {
            operationType: 'avatarUpdatedForUser',
            userId
        }
    }
    admin.messaging().send(message)
        .then(
            function (response) {
            }
        )
        .catch(
            function (error) {
                console.log(error)
            }
        )
}

const sendNewMessageNotification = (fcmId, room, chat) => {
    const message = {
        token: fcmId,
        data: {
            operationType: 'newMessage',
            roomName: room.name,
            roomId: room._id.toString(),
            message: chat.message,
            authorId: chat.author.toString(),
            authorName: chat.authorDetail.name,
            createdAt: chat.createdAt.toUTCString()
        }
    }

    admin.messaging().send(message)
        .then(
            function (response) {
            }
        )
        .catch(
            function (error) {
                console.log(error)
            }
        )
}

const readAllNotificationForRoomNotification = (fcmIds, roomId) => {
    fcmIds.forEach(
        (fcmId) => {
            const message = {
                token: fcmId,
                data: {
                    operationType: 'messageReadForRoom',
                    roomId
                }
            }

            admin.messaging().send(message)
                .then(
                    function (response) {
                    }
                )
                .catch(
                    function (error) {
                        console.log(error)
                    }
                )
        }
    )
}

module.exports = {
    sendAvatarUpdatedNotification,
    sendPingBackNotification,
    subscribeToAvatarUpdateTopic,
    unSubscribeToAvatarUpdateTopic,
    sendAvatarUpdatedForUserNotification,
    sendNewMessageNotification,
    readAllNotificationForRoomNotification
}