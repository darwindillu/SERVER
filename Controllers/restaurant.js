const restaurantCollection = require('../Model/restaurantSchema')
const jwt = require('jsonwebtoken')
const menuCollection = require('../Model/menuItems')
const agentCollection = require('../Model/agentSchema')
const orderCollection = require('../Model/orderSchema')
const mongoose = require('mongoose')
const userCollection = require('../Model/userSchema')

const getName= async(req,res)=>{

    const {id}= req.body
    
    const name= await restaurantCollection.findOne({_id:id},{restaurantName:1,profile:1})

    res.status(200).json({message:'Successfully fetched',name:name})
}

const getData = async(req,res)=>{

    const {id} = req.body
    const restData = await restaurantCollection.findById(id)

    res.status(200).json({message:'successfully fetched',restData:restData})
}

const editData = async (req, res) => {
    try {
        const { restaurant, id } = req.body;

        await restaurantCollection.findOneAndUpdate(
            { _id: id },
            { $set:
             { openingTime: restaurant.openingTime, closingTime: restaurant.closingTime,
               description: restaurant.description,category:restaurant.category } }
        );

        const editedRestaurant = await restaurantCollection.findById(id)
        res.status(200).json({message:'Restaurant data updated successfully',editedRestaurant:editedRestaurant});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

const editImage = async(req,res)=>{
    try {

        const  id  = req.body.id;
        const  filename  = req.file.filename;

        await restaurantCollection.findOneAndUpdate(
            { _id: id },
            { $set: { profile: filename } },
            { new: true }
        );

        res.status(200).json({ message: 'File Added Successfully' });

    } catch (error) {

        console.error('Error adding file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const addMenu = async (req, res) => {
    try {

        const file = req.file.filename
        const restId = req.body.restId
        const menuName = req.body.menuName
        const description = req.body.description
        const category = req.body.category
        const price = req.body.price
  
      const newMenu = {
        menuName: menuName,
        category: category,
        price: price,
        image: file,
        description: description,
        restaurantId: restId,
      };
  
      await menuCollection.insertMany([newMenu]);
  
      res.status(200).json({ message: 'Menu added successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
}

const getLocation = async(req,res)=>{
   try {
    
       const {latitude,longitude,id} = req.body
   
       await restaurantCollection.findOneAndUpdate({_id:id},{$set:{latitude:latitude,longitude:longitude}})
   
       res.status(200).json({message:'Location added successfully'})
   } catch (error) {
      
    console.log(error);
   }
}

const getAgents = async(req,res)=>{
    try {

        const agents = await agentCollection.find()
        res.status(200).json({message:'Agents fetched successfully',agents})
        
    } catch (error) {
        console.log(error);
    }
}

const getMenu = async(req,res)=>{
    try {

        const {id} = req.body

        const restaurant = await restaurantCollection.findById(id)
        const menu = await menuCollection.find({restaurantId:id})

        res.status(200).json({restaurant:restaurant,menu:menu})
    } catch (error) {

        console.log(error);
        
    }
}

const editMenu = async(req,res)=>{
    try {
        
        const menuData = req.body.formData
        const menu = JSON.parse(menuData)
        const {menuId} =req.body

        await menuCollection.findOneAndUpdate(
            {_id:menuId},
            {menuName:menu.menuName,
            description:menu.description,
            price:menu.price,
            category:menu.category}
        )

        const menus = await menuCollection.findById(menuId)

        res.status(200).json({message:'Menu edited successfully'})
    } catch (error) {

        console.log(error);
    }
}

const getOrders = async (req, res) => {
    try {
        const { id } = req.body;

        const filteredItems = await orderCollection.aggregate([
            { $match: { "items.restId": new mongoose.Types.ObjectId(id) } },
            { $sort: { 'items.orderDate': -1 } },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    items: { $push: "$items" },
                    orderTotal: { $first: "$orderTotal" },
                    paymentMethod: { $first: "$paymentMethod" },
                    addressId: { $first: "$addressId" },
                    status:{$first:'$status'},
                    orderDate: { $first: "$orderDate" }
                }
            }
        ]);

        res.status(200).json({ message: 'Orders fetched successfully', orderLists: filteredItems });
    } catch (error) {
        console.log(error);
    }
}


const updateReason = async (req, res) => {
    try {
      const {  orderId, reason } = req.body;
  
      const order = await orderCollection.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ message: 'Order does not have any items' });
      }
  
      order.rejectedReason = reason;
      order.status = 'rejected'
  
      await order.save();
  
      res.status(200).json({ message: 'Order reason updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

const acceptOrder = async (req, res) => {
    try {
      const { orderId } = req.body;
  
      const order = await orderCollection.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ message: 'Order does not have any items' });
      }

      order.status = 'preparing'
  
      await order.save();
  
      res.status(200).json({ message: 'Order reason updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

const pickUp = async(req,res)=>{
    try {
        
        const { orderId } = req.body;
  
      const order = await orderCollection.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ message: 'Order does not have any items' });
      }
  
      order.status = 'ready to pick'
  
      await order.save();
  
      res.status(200).json({ message: 'Order reason updated successfully' });
    } catch (error) {
        console.log(error);
    }
}

const filterOrders = async (req, res) => {
    try {
        const { value, restId } = req.body;

        const filteredItems = await orderCollection.aggregate([
            { $match: { "items.restId": new mongoose.Types.ObjectId(restId), "status":value } },
            { $sort: { 'items.orderDate': -1 } },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    items: { $push: "$items" },
                    orderTotal: { $first: "$orderTotal" },
                    paymentMethod: { $first: "$paymentMethod" },
                    addressId: { $first: "$addressId" },
                    status:{$first:'$status'},
                    orderDate: { $first: "$orderDate" }
                }
            }
        ]);

        res.status(200).json({ message: 'Filtered orders fetched successfully', filteredItems });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching filtered orders' });
    }
};

const assignOrder = async (req, res) => {
    try {
      const { orderId, agents,restId } = req.body;
    
      const order = await orderCollection.findById(orderId);

      const user = await userCollection.findById(order.userId)

      const restaurant = await restaurantCollection.findById(restId)

      const item = order.items.map(item=>({
        menuName:item.menuName,
        menuid:item.menuId,
        price:item.price,
        quantity:item.quantity,
        totalPrice:item.totalPrice,
        image:item.image
      }))

      const data = {
        orderId:orderId,
        paymentMethod:order.paymentMethod,
        orderDate:order.orderDate,
        addressId:order.addressId,
        userLatitude:order.userLatitude,
        userLongitude:order.userLongitude,
        restLatitude:restaurant.latitude,
        restLongitude:restaurant.longitude,
        items:item,
        orderTotal:order.orderTotal,
        username:user.username,
        mobile:user.mobile,
        restId:restId,
        restaurantName:restaurant.restaurantName
      }
  
      const sortedAgents = agents.sort((a, b) => a.distance - b.distance);
  
      let assignedAgent = null;
  
      for (let agentId of sortedAgents) {
        const agent = await agentCollection.findById(agentId);
  
        if (agent && agent.status !== 'assigned') {
          const result = await agentCollection.findByIdAndUpdate(
            agent._id,
            { $push: { order: data }, status: 'assigned' },
            { new: true } // Return the updated document
          );
  
          if (result) {
            assignedAgent = result;
            break;
          }
        }
      }
  
      if (!assignedAgent) {
        return res.status(400).json({ message: 'No agents are free' });
      }
  
      res.status(200).json({ message: 'Assigned successfully', closestAgent: assignedAgent });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  

module.exports = restaurantController = {getName,getData,editData,editImage,addMenu,getLocation,getAgents,getMenu,editMenu,getOrders,updateReason,acceptOrder,filterOrders,assignOrder,pickUp}