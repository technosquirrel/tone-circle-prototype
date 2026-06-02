const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let state = false;
let timer = 0;
let userCount = 0;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
    console.log('New WS Connection...');
    userCount++;
    socket.emit('newConnect', {state: state, time: timer});

    // TODO
    socket.on('joinRoom', ({ room }) => {
        socket.join(user.room);
    })

    // send play to all (should be to all in room)
    socket.on('play', () => {
        console.log('Sending play...');
        state = true;
        io.sockets.emit('play');
    })

    // send pause to all (should be to all in room)
    socket.on('pause', () => {
        console.log('Sending pause...');
        state = false;
        io.sockets.emit('pause');
    })

    socket.on('reset', () => {
        io.sockets.emit('reset');
    })

    socket.on('sync', (data) => {
        io.sockets.emit('sync', data);
    })

    socket.on('timer', (data) => {
        timer = data.time;
    })

    socket.on('disconnect', (socket) => {
        userCount--;
        if (userCount === 0) {
            state = false;
            timer = 0;
        }
        console.log('Client has disconnected');
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});