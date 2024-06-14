const express = require('express');
const path = require('path');
const app = express();
const env = require('dotenv').config();
const utils = require('./utils/mongoose');
const userRouter = require('./Routes/user');
const cors = require('cors');
const adminRouter = require('./Routes/admin');
const restaurantRouter = require('./Routes/restaurant');
const agentRouter = require('./Routes/agent');
const authRouter = require('./Routes/auth');
const http = require('http');
const socket = require('./server'); 

const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use(express.static('Public'));

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/restaurant', restaurantRouter);
app.use('/agent', agentRouter);
app.use('/auth', authRouter);

socket.init(server);

server.listen(process.env.PORT, () => {
    console.log('Server running @3000');
});

app.post('/add-location', (req, res) => {
    const { userId, location } = req.body;
    console.log(userId, location);
    socket.getIO().emit('userLocationUpdate', { userId, location });
    res.sendStatus(200);
});


