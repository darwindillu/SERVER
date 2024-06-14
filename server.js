const socketIO = require('socket.io');

let io;
let socketMap = {};

function init(server) {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('userLocation', ({ id, location }) => {
            socketMap[id] = socket.id;
            console.log(`User ${id} location:`, location);
            io.emit('userLocationUpdate', { id, location });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            const userId = Object.keys(socketMap).find(key => socketMap[key] === socket.id);
            if (userId) {
                delete socketMap[userId];
            }
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
}

module.exports = {
    init,
    getIO
};
