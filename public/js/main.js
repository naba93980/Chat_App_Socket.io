const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')
const userList = document.getElementById('users')
const roomName = document.getElementById('room-name')
const url = new URL(window.location.href)
const searchParams = url.searchParams
const username = searchParams.get('username')
const room = searchParams.get('room')

const socket = io()

// 1. join room
socket.emit('joinRoom', { room, username })


// 2. send chat message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get messag text 
    const chatMessage = e.target.elements.msg.value

    // emit message to server
    socket.emit('chat', chatMessage)

    // clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})


socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

// receives message event from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message)
})


// rendering message in DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">${message.text}</p>`
    chatMessage.appendChild(div)
    chatMessage.scrollTop = chatMessage.scrollHeight
}

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    console.log(users);
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username
        userList.appendChild(li)
    })
}