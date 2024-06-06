const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({

    menuName:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    isAvailable:{
        type:Boolean,
        defualt:true
    },
    isBlocked:{
        type:Boolean,
        default:false
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
    role:{
        type:String,
        default:'menu'
    }
})

module.exports = menuCollection = mongoose.model('menu',menuSchema)