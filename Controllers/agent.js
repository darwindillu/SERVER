const agentCollection = require('../Model/agentSchema')
const restaurantCollection = require('../Model/restaurantSchema')
const orderCollection = require('../Model/orderSchema')
const userCollection = require('../Model/userSchema')

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

        const currentDate = new Date(Date.now())
        const formattedDate = currentDate.toLocaleDateString('en-US');

        const todaysEarnings = orderList.reduce((total, order) => {
            if (order.status === 'delivered' && new Date(order.assignedDate).toLocaleDateString('en-US') === formattedDate) {
              return total + order.deliveryCharge;
            } else {
              return total;
            }
          }, 0); 

        res.status(200).json({message:'Order fetched successfully',orderList,todaysEarnings})
        
    } catch (error) {
        console.log(error);
    }
}

const acceptOrder = async(req,res)=>{
    try {
        const {orderId,agentId} = req.body

        await agentCollection.updateOne(
            {_id:agentId, "order.orderId":orderId},
            {$set:{ "order.$.status":'accepted'}},
            {new:true}
        )

        await orderCollection.updateOne(
            {_id:orderId},
            {$set: { status:'agent accepted'}},
            {new:true}
        ) 
        
        res.status(200).json({message:'Successfull'})
    }catch(error){
        console.log(error);
    }
}

const rejectOrder = async(req,res)=>{
    try {
        
        const {orderId,agentId,rejectReason} = req.body

        await agentCollection.findOneAndUpdate(
            { _id: agentId, "order.orderId": orderId },
            {
              $set: {
                "order.$.status": "rejected",
                "order.$.rejectedReason": rejectReason,
                "order.$.rejectedDate": Date.now(),
                "order.$agentId":agentId,
                status: "available", 
              },
              $unset:{
                "order.$.items":1,
                "order.$.orderTotal":1,
                "order.$.username":1,
                "order.$.mobile":1,
                "order.$.userLatitude":1,
                "order.$.userLongitude":1,
                "order.$.paymentMethod":1,
                "order.$.addressId":1,
                "order.$.restLatitude":1,
                "order.$.restLongitude":1,
                "order.$.restId":1
              }
            },
            { new: true }
          );

        await orderCollection.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:'agent rejected'}},
            {new:true}
        )

       res.status(200).json({message:'rejected'})
    } catch (error) {
        console.log(error);
    }
}

const pickOrder = async(req,res)=>{
    try {
        const {orderId,agentId} = req.body

        const order = await orderCollection.findById(orderId)

        if(order.status !== 'ready to pick'){
           return res.status(400).json({message:'not ready for pickup'})
        }

        await orderCollection.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:'out for delivery'}},
            {new:true}
        )

        await agentCollection.findOneAndUpdate(
            {_id:agentId,"order.orderId":orderId},
            {$set:{"order.$.status":'out for delivery'}},
            {new:true}
        )

        res.status(200).json({message:'out for delivery'})
    } catch (error) {
        console.log(error);
    }
}

const deliverOrder = async(req,res)=>{
    try {
        
        const {orderId,agentId} = req.body

        await orderCollection.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:'delivered'}},
            {new:true}
        )

        const currentDate = new Date(Date.now())
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const day = currentDate.getDate()
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        await agentCollection.findOneAndUpdate(
            {_id:agentId,"order.orderId":orderId},
            {$set:{"order.$.status":'delivered',status:'available',"order.$.deliveredDate":formattedDate},
             $unset:
                { 
                    "order.$.items":1,
                    "order.$.username":1,
                    "order.$.mobile":1,
                    "order.$.userLatitude":1,
                    "order.$.userLongitude":1,
                    "order.$.paymentMethod":1,
                    "order.$.addressId":1,
                    "order.$.restLatitude":1,
                    "order.$.restLongitude":1,
                    "order.$.restId":1,
                }
            },
            {new:true}
        )

        res.status(200).json({message:'delivered'})
    } catch (error) {
        console.log(error);
    }
}

const filteredOrders = async(req,res)=>{
    try {
        
        const {startDate,endDate,agentId}=req.body

        const agent = await agentCollection.findById(agentId)

        const orderField = 'assignedDate'

        const filterLists = agent.order.filter((order) => {
            const orderDate = new Date(order[orderField]); 
      
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
          });
        
        
        res.status(200).json({message:'fetched',filterLists})

    } catch (error) {
        console.log(error);
    }
}

module.exports = agentController = {location,getRestaurants,orders,acceptOrder,rejectOrder,pickOrder,deliverOrder,filteredOrders}