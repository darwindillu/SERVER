const mongoose = require('mongoose')

const billingSchema = mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email:{
        type:String
    },
    mobile:{
        type:String
    },
    address:{
        type:String
    },
    userId:{
        type:String,
        refer:'user'
    }
})

const billingCollection = mongoose.model('billing',billingSchema)

module.exports = billingCollection