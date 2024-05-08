const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({

    itemName:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    offer:{
        type:String,
        default:''
    },
    category:{
        type:String
    },
    image:{
        type:String
    },
    restaurantId:{
        type:String,
        refer:'restaurant'
    },
    userId:{
        type:String,
        refer:'user'
    },
    quantity:{
        type:Number,
        default:1
    },
    totalPrice:{
        type:Number,
    },
    grandPrice:{
        type:Number,
    }
})

module.exports = cartCollection = mongoose.model('cart',cartSchema)