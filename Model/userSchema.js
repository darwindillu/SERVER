const mongoose= require('mongoose')

const userSchema= mongoose.Schema({
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
    role:{
        type:String,
        default:'user'
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    signupStatus:{
        type:String,
        default:'approved'
    }
})

const userCollection= mongoose.model('user',userSchema)

module.exports = userCollection