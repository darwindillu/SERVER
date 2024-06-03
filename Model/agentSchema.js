const mongoose= require('mongoose')
const moment = require('moment-timezone');

const IST = 'Asia/Kolkata';

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
    },
    order:[{
        orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'order'
        },
        items:[{

        menuName:{
            type:String,
        },
        menuId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'menu'
        },
        price:{
            type:Number
        },
        quantity:{
            type:Number
        },
        totalPrice:{
            type:Number
        },
        image:{
            type:String
        }

        }],

        orderTotal:{
            type:Number
        },
        username:{
            type:String
        },
        mobile:{
            type:Number
        },
        userLatitude:{
            type:Number
        },
        userLongitude:{
            type:Number
        },
        orderDate:{
            type:String
        },
        assignedDate:{
            type: Date,
            default: () => moment().tz(IST).toDate()
        },
        status:{
            type:String,
            default:'pending'
        },
        paymentMethod:{
            type:String
        },
        addressId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'billing'
        },
        restLatitude:{
            type:Number
        },
        restLongitude:{
            type:Number
        },
        restId:{
            type:String
        },
        restaurantName:{
            type:String
        }
    }],
    status:{
        type:String,
        default:'available'
    }
})

const agentCollection= mongoose.model('agent',agentSchema)

module.exports = agentCollection