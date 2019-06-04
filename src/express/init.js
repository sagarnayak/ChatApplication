const express = require('express')
const app = express()

const auth = require('./middleware/auth')

const userRouter = require('./route/user')
const defaultRouter = require('./route/default')

app.use(auth)

app.use(express.json())
app.use(userRouter)
app.use(defaultRouter)

const http = require('http')
const server = http.createServer(app)

module.exports = server