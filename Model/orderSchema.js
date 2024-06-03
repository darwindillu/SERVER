const mongoose = require('mongoose');
const moment = require('moment-timezone');

const IST = 'Asia/Kolkata';

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    items: [{
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'menu'
        },
        menuName: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        restId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'rest'
        },
    }],
    
    orderDate: {
        type: Date,
        default: () => moment().tz(IST).toDate()
    },
    rejectedReason:{
        type:String
    },
    restarantLatitude:{
        type:Number
    },
    restaurantLongitude:{
        type:Number
    },
    userLatitude:{
        type:Number
    },
    userLongitude:{
        type:Number
    },
    agentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'agent'
    },
    status:{
        type:String,
        default:'pending'
    },
    orderTotal: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'billing'
    },
    
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
