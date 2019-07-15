const { io } = require('../express/init')
const jwt = require('jsonwebtoken')
const User = require('../mongoose/model/user')
const Room = require('../mongoose/model/room')
const Chat = require('../mongoose/model/chat')
const chalk = require('chalk')
const {
    sendNewMessageNotification
}
    = require('../firebase/cloudMessage')

const connectedSockets = []

const getUserData = async (socket) => {
    const token = socket.handshake.query.token.replace('Bearer ', '')
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    return user
}

const addSocketToConnectedList = async (socket) => {
    const user = await getUserData(socket)
    connectedSockets.push(
        {
            socket,
            userId: user._id
        }
    )

    connectedSockets.forEach(
        (connectedSocket) => {
            console.log(connectedSocketsocket..id, '::', connectedSocket.userId)
        }
    )
}

const removeSocketFromConnectedSockets = (socket) => {
    const index = connectedSockets.findIndex(
        (s) => {
            if (s.socket.id === socket.id)
                return true
            return false
        }
    )

    if (index)
        connectedSockets.splice(index, 1)

    connectedSockets.forEach(
        (connectedSocket) => {
            console.log(connectedSocketsocket..id, '::', connectedSocket.userId)
        }
    )
}

const getChats = async (reqData, socket) => {
    if (
        reqData.roomId &&
        reqData.limit &&
        reqData.skip
    ) {
        const chats = await Chat.find(
            {
                room: reqData.roomId
            }
        )
            .limit(
                parseInt(reqData.limit)
            )
            .skip(
                parseInt(reqData.skip)
            )
            .sort(
                {
                    createdAt: 'desc'
                }
            )

        let allPromise = []

        chats.forEach(
            async (chat) => {
                allPromise.push(
                    chat.populate(
                        {
                            path: 'authorDetail'
                        }
                    ).execPopulate()
                )
            }
        )

        Promise.all(allPromise)
            .then(
                (result) => {
                    socket.emit(
                        'newMessages',
                        result
                    )
                }
            )
            .catch(
                (error) => {
                    console.log(error)
                }
            )
    }
}

const getSocketForUser = (user) => {
    let socket = connectedSockets.find(
        (s) => {
            if (s.userId.toString() === user._id.toString()) {
                return true
            }
        }
    )
    return socket
}

const sendMessageToUsers = async (chat, room) => {
    await room.populate(
        {
            path: 'users'
        }
    ).execPopulate()

    io.to('room_' + room._id).emit(
        'newMessage',
        chat
    )

    room.users.forEach(
        async (user) => {
            const socket = getSocketForUser(user)

            const name = user.name

            if (socket) {
                console.log('socket found for : ' + name)
            } else {
                console.log('socket not found for : ' + name)

                user.tokens.forEach(
                    (token) => {
                        if (token.fcmToken) {
                            sendNewMessageNotification(
                                token.fcmToken.toString(),
                                room,
                                chat
                            )
                        }
                    }
                )
            }
        }
    )
}

const sendMessage = async (reqData, socket, shouldDisconnectAfterUse) => {
    const room = await Room.findOne({ _id: reqData.roomId })
    const user = await getUserData(socket)

    if (shouldDisconnectAfterUse)
        socket.disconnect()

    const chat = Chat(
        {
            message: reqData.message,
            author: user._id,
            room: room._id
        }
    )

    await chat.save()

    await chat.populate(
        {
            path: 'authorDetail'
        }
    ).execPopulate()

    sendMessageToUsers(chat, room)
}

io.use(
    async function (socket, next) {
        try {
            const token = socket.handshake.query.token.replace('Bearer ', '')
            const decoded = await jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

            if (!user) {
                next(new Error('auth error'))

                setTimeout(
                    () => {
                        socket.disconnect()
                    },
                    1000
                )

                console.log('auth failed in socket')
            } else {
                console.log('auth success for >> ' + user.name, "id : ", user._id)
                next()
            }
        } catch (error) {
            console.log(error)
            next(new Error('auth error'))
        }
    }
)

io.on(
    'connection',
    (socket) => {
        addSocketToConnectedList(socket)
        socket.emit('youAreConnected')

        socket.on(
            'disconnect',
            () => {
                removeSocketFromConnectedSockets(socket)
                console.log('disconnected a client')
            }
        )

        socket.on(
            'join',
            (roomId) => {
                socket.join(
                    'room_' + roomId,
                    (err) => {
                        if (err)
                            console.log(err)
                    }
                )
            }
        )

        socket.on(
            'getChatData',
            (req) => {
                const reqData = JSON.parse(req)
                getChats(
                    reqData,
                    socket
                )
            }
        )

        socket.on(
            'sendNewMessage',
            (req) => {
                const reqData = JSON.parse(req)

                sendMessage(
                    reqData,
                    socket,
                    false
                )
            }
        )

        socket.on(
            'sendNewMessageAndDisconnect',
            (req) => {
                const reqData = JSON.parse(req)

                sendMessage(
                    reqData,
                    socket,
                    true
                )
            }
        )
    }
)

console.log(chalk.green.inverse('socket'), chalk.green(' is up'))