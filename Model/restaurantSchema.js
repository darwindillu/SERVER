const mongoose= require('mongoose')

const restaurantSchema= mongoose.Schema({
    restaurantName:{
      type:String
    },
    email:{
        type:String,
        unique:true
    },
    description:{
        type:String,
    },
    street:{
        type:String
    },
    city:{
        type:String
    },
    district:{
        type:String
    },
    pincode:{
        type:String
    },
    openingTime:{
        type:String
    },
    password:{
        type:String
    },
    otp:{
        type:Number,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        default:'restaurant'
    },
    signupStatus:{
        type:String,
        default:'pending'
    },
    category:{
        type:String
    },
    closingTime:{
        type:String
    },
    category:{
        type:String
    },
    profile:{
        type:String
    },
    latitude:{
        type:Number
    },
    longitude:{
        type:Number
    }
  },
  {
    timestamps:true
  }
)

const restaurantCollection= mongoose.model('rest',restaurantSchema)

module.exports = restaurantCollection