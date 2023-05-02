const path = require('path')
const http = require('http')
const express = require("express")
const { Server } = require('socket.io')

const app = express()
const httpServer = http.createServer(app)
const ioServer = new Server(httpServer, {
    cors: "*"
})

const PORT = 3000 || process.env.PORT

app.use(express.static(path.resolve(__dirname, 'public')))


ioServer.on('connection', socket => {

    // emitting a new welcome message upon connection
    socket.emit('message', 'Welcome to Chat App')

    // broadcast joining message when there is new connection
    socket.broadcast.emit('message', 'A user has joined the chat')

    // broadcast leaving message when a user disconnects
    socket.on('disconnect', () => {
        ioServer.emit('message', 'A user has left the chat')
    })

    // listening for chat event
    socket.on('chat', (message) => {

        // broadcast chat message
        ioServer.emit('message', message)
    })
})

httpServer.listen(PORT, () => console.log(`Server started at port ${PORT}`))