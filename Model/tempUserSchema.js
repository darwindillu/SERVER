const mongoose= require('mongoose')

const tempUserSchema= mongoose.Schema({
    username:{
      type:String
    },
    email:{
        type:String,
        unique:true
    },
    mobile:{
        type:Number,
        unique:true
    },
    password:{
        type:String
    },
    image:{
        type:String
    },
    otp:{
        type:Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const tempUserCollection= mongoose.model('tempUser',tempUserSchema)

module.exports = tempUserCollection