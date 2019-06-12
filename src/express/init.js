const express = require('express')
const app = express()

const userRouter = require('./route/user')
const defaultRouter = require('./route/default')

app.use(express.json())
app.use(userRouter)
app.use(defaultRouter)

const http = require('http')
const server = http.createServer(app)

const socket = require('socket.io')
const io = socket(
    server,
    {
        allowRequest(
            reqData,
            callBack
        ) {
            console.log('socket middleware')
            callBack(undefined, true)
        }
    }
)

module.exports = {
    server,
    io
}