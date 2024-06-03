const express= require('express')
const path= require('path')
const app= express()
const env= require('dotenv').config()
const utils = require('./utils/mongoose')
const userRouter= require('./Routes/user')
const cors= require('cors')
const adminRouter= require('./Routes/admin')
const restaurantRouter = require('./Routes/restaurant')
const agentRouter = require('./Routes/agent')
const authRouter = require('./Routes/auth')
const cookieParser = require('cookie-parser')
 

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use(express.static('Public'));

app.use('/user',userRouter) 
app.use('/admin',adminRouter)
app.use('/restaurant',restaurantRouter)
app.use('/agent',agentRouter)
app.use('/auth',authRouter)
 
app.listen(process.env.PORT,()=>{
    console.log('Server running @3000');
})