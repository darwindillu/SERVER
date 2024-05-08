const mongoose= require('mongoose')

const agentSchema= mongoose.Schema({
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
    isBlocked:{
        type:Boolean,
        default:false
    },
    toPay:{
        type:Number,
        default:0
    },
    role:{
        type:String,
        default:'agent'
    },
    signupStatus:{
        type:String,
        default:'approved'
    },
    latitude:{
        type:Number
    },
    longitude:{
        type:Number
    }
})

const agentCollection= mongoose.model('agent',agentSchema)

module.exports = agentCollection