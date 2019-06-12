const { io } = require('../express/init')

io.on(
    'connection',
    (socket) => {
        console.log('socket hit')
        socket.emit('hello there')
    }
)

console.log('socket is up')