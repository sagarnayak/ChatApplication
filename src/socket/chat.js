const { io } = require('../express/init')
const jwt = require('jsonwebtoken')
const User = require('../mongoose/model/user')
const Room = require('../mongoose/model/room')
const Chat = require('../mongoose/model/chat')
const chalk = require('chalk')

const connectedSockets = []

const addSocketToConnectedList = (socket) => {
    connectedSockets.push(
        socket
    )
}

const removeSocketFromConnectedSockets = (socket) => {
    const index = connectedSockets.findIndex(
        (s) => {
            if (s.id === socket.id)
                return true
            return false
        }
    )

    connectedSockets.splice(index, 1)
}

const getUserData = async (socket) => {
    const token = socket.handshake.query.token.replace('Bearer ', '')
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    return user
}

const getChats = async (reqData, socket) => {
    const user = await getUserData(socket)
}

const sendMessage = async (reqData, socket) => {
    const room = await Room.findOne({ _id: reqData.roomId })
    const user = await getUserData(socket)

    const chat = Chat(
        {
            message: reqData.message,
            author: user._id,
            room: room._id
        }
    )

    await chat.save()
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
                    socket
                )
            }
        )
    }
)

console.log(chalk.green.inverse('socket'), chalk.green(' is up'))