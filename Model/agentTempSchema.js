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
    }
})

const agentCollection= mongoose.model('tempAgent',agentSchema)

module.exports = agentCollection