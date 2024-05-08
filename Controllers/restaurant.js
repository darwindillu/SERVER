const restaurantCollection = require('../Model/restaurantSchema')
const jwt = require('jsonwebtoken')
const menuCollection = require('../Model/menuItems')
const agentCollection = require('../Model/agentSchema')

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
        console.log(menus);

        res.status(200).json({message:'Menu edited successfully'})
    } catch (error) {

        console.log(error);
    }
}


module.exports = restaurantController = {getName,getData,editData,editImage,addMenu,getLocation,getAgents,getMenu,editMenu}