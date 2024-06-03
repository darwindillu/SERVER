const agentCollection = require('../Model/agentSchema')
const restaurantCollection = require('../Model/restaurantSchema')

const location = async(req,res)=>{
    try {
        
        const {latitude,longitude,id} = req.body

        await agentCollection.findOneAndUpdate({_id:id},{$set:{latitude:latitude,longitude:longitude}})
        res.status(200).json({message:'Location updated successfully'})

    } catch (error) {
        console.log(error);
    }
}

const getRestaurants = async(req,res)=>{
    try {
        
        const restaurants = await restaurantCollection.find({})
        res.status(200).json({message:'Restaurants fetched successfully',restaurants:restaurants})

    } catch (error) {
        
    }
}

const orders = async(req,res)=>{
    try {
        const {id} = req.body
        const agent = await agentCollection.findById(id)
        const orderList = agent.order
        res.status(200).json({message:'Order fetched successfully',orderList})
    } catch (error) {
        console.log(error);
    }
}

module.exports = agentController = {location,getRestaurants,orders}