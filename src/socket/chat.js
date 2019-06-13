const { io } = require('../express/init')

io.use(
    function (socket, next) {
        console.log('token ', socket.handshake.query.token)
        next()
        // next(new Error('auth error'))

        // setTimeout(
        //     () => {
        //         socket.disconnect()
        //     },
        //     1000
        // )
    }
)

io.on(
    'connection',
    (socket) => {
        console.log('socket hit')
        socket.on('msg_from_client', (message) => {
            console.log('client : ', message)
        })
        socket.emit('msg_from_server', 'Hello client')
    }
)

console.log('socket is up')