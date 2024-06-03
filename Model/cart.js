const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    
    menuId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'menu'
    },
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
    },
    restId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'rest'
    }
})

module.exports = cartCollection = mongoose.model('cart',cartSchema)