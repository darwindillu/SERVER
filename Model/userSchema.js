const mongoose= require('mongoose')
const moment = require('moment-timezone')
const IST = 'Asia/Kolkata'

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
    },
    latitude:{
        type:Number
    },
    longitude:{
        type:Number
    },
    walletBalance:{
        type:Number,
        default:0
    },
    walletHistory:[{
        menuId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'menu'
        },
        menuName:{
            type:String
        },
        total:{
            type:Number
        },
        date:{
            type:Date,
            default:()=>  moment().tz(IST).toDate()
        }
    }],
})

const userCollection= mongoose.model('user',userSchema)

module.exports = userCollection