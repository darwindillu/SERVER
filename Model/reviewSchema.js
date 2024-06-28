const mongoose= require('mongoose')

const reviewSchema = mongoose.Schema({
    restId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'rest'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    userName:{
        type:String
    },
    userEmail:{
        type:String
    },
    userMobile:{
        type:Number
    },
    agentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'agent'
    },
    review:{
        type:String
    },
    roleAgent:{
        type:Boolean,
        default:false
    },
    roleRestaurant:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: String,
        default: () => {
          const options = { month: 'long', day: 'numeric',year: 'numeric' };
          return new Date().toLocaleDateString(undefined, options);
        }
      }
})

module.exports= reviewCollection = mongoose.model('review',reviewSchema)