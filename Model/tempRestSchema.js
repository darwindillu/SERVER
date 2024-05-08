const mongoose= require('mongoose')

const tempRestaurantSchema= mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const tempRestCollection= mongoose.model('tempRest',tempRestaurantSchema)

module.exports = tempRestCollection