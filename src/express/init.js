const express = require('express')
const app = express()

const userRouter = require('./route/user')
const roomRoute = require('./route/room')
const defaultRouter = require('./route/default')

app.use(express.json())
app.use(userRouter)
app.use(roomRoute)
app.use(defaultRouter)

const http = require('http')
const server = http.createServer(app)

const socket = require('socket.io')
const io = socket(server)

module.exports = {
    server,
    io
}