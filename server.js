const path = require('path')
const http = require('http')
const express = require("express")
const { Server } = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const httpServer = http.createServer(app)
const ioServer = new Server(httpServer, {
    cors: "*"
})

const PORT = 3000 || process.env.PORT

app.use(express.static(path.resolve(__dirname, 'public')))


ioServer.on('connection', socket => {

    // 1. client connects -----------------
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        // emitting a new welcome message upon connection
        socket.emit('message', formatMessage('Bot', 'Welcome to Chat App'))

        // broadcast to room joining message when there is new connection
        socket.to(user.room).emit('message', formatMessage('Bot', `${user.username} has joined the chat`))

        // send users and room info
        ioServer.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // 2. listening for chat event ------------------
    socket.on('chat', (message) => {

        const user = getCurrentUser(socket.id)

        // broadcast chat message
        ioServer.to(user.room).emit('message', formatMessage(user.username, message))
    })

    // 3. broadcast leaving message when a user disconnects ------------------
    socket.on('disconnect', () => {

        const user = userLeave(socket.id)

        if (user) {

            ioServer.to(user.room).emit('message', formatMessage('Bot', `${user.username} user has left the chat`))

            // send users and room info
            ioServer.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })
})

httpServer.listen(PORT, () => console.log(`Server started at port ${PORT}`))