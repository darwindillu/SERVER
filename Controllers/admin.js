const agentCollection = require('../Model/agentSchema')
const restaurantCollection = require('../Model/restaurantSchema')
const userCollection = require('../Model/userSchema')

const getAll= async(req,res)=>{
  try{

    const {role} = req.body

    let collection;

    switch(role){
      case 'user':
        collection=userCollection
        break;
      case 'agent':
        collection=agentCollection
        break;
      case 'restaurant':
        collection=restaurantCollection
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users= await collection.find({role:{$ne:'superAdmin'}})
  
    if (users.length > 0) {
      res.status(200).json({ users: users });
    } else {
      res.status(404).json({ message: 'No users found' });
    }

  }catch(e){

    res.status(500).json({message:'Internal server error'})
  }
}


const search= async(req,res)=>{

  const {name,role}=req.body

  const newName= name.toLowerCase()

  let collection;
  let searchField;

  switch(role){
    case 'user':
      collection=userCollection
      searchField='username'
      break;
    case 'agent':
      collection=agentCollection
      searchField='username'
      break;
    case 'restaurant':
      collection=restaurantCollection
      searchField='restaurantName'
      break;
    default:
      return res.status(400).json({ message: 'Invalid role specified' });
  }

  const filteredUser = await collection.find(
    { [searchField]: { $regex: new RegExp(`^${newName}`, 'i') } },
    { password: 0 }
  );

  if (filteredUser.length > 0) {
    res.status(200).json({message:`${role} found`, filtered: filteredUser });
  } else {
    res.status(404).json({ message: 'No users found',role:role });
  }

}

const blockUser= async(req,res)=>{
    try {

      const {id,role}= req.body
      let collection;

      switch (role) {
        case 'user':
          collection=userCollection
          break;
        case 'agent':
          collection=agentCollection
          break;
        case 'restaurant':
          collection=restaurantCollection
          break;  
        default:
          res.json({message:'role not found'})
          break;
      }

      await collection.updateOne({_id:id},{$set:{isBlocked:true}})
      res.status(200).json({message:'User blocked successfully',role:role})

    }catch (error) {
      res.status(500).json({message:'Internal server error'})
    }
}

const unBlockUser= async(req,res)=>{
  try {

    const {id,role}= req.body

    let collection;

    switch (role) {
      case 'user':
        collection=userCollection
        break;
      case 'agent':
        collection=agentCollection
        break;
      case 'restaurant':
        collection=restaurantCollection
        break;  
      default:
        res.json({message:'role not found'})
        break;
    }

    await collection.updateOne({_id:id},{$set:{isBlocked:false}})
    res.status(200).json({message:'User unblocked successfully',role:role})

  }catch (error) {
    res.status(500).json({message:'Internal server error'})
  }
}

const makeAdmin= async(req,res)=>{
    try {
        const {id}=req.body
        await userCollection.updateOne({_id:id},{role:'admin'})
        res.status(200).json({message:'make admin successfully'})
    } catch (error) {
        res.json({message:'Internal server error'})
    }
}

const removeAdmin= async(req,res)=>{
    try {
        const {id}=req.body
        await userCollection.updateOne({_id:id},{role:'user'})
        res.status(200).json({message:'admin removed successfully'})
    } catch (error) {
        res.json({message:'Internal server error'})
    }
}

const getSpecificData= async(req,res)=>{
  try {

      const {id} = req.body

      const data = await restaurantCollection.findById(id)

      if(data){
          res.status(200).json({message:'fetched successfully',data:data})
      }else{
          res.status(404).json({message:'fetching failed'})
      }

  } catch(error) {
      res.status(500).json({message:'Internal server error'})
  }
}

const restaurantAccept = async(req,res)=>{
  try {
    
    const {id} = req.body
    await restaurantCollection.updateOne({_id:id},{signupStatus:'accepted'})
    res.status(200).json({message:'Restaurant accepted successfully'})

  } catch (error) {    
    res.status(500).json({message:'Internal server error'})
  }
}

const restaurantReject = async(req,res)=>{
  try {
    
    const {id} = req.body
    await restaurantCollection.updateOne({_id:id},{$set:{signupStatus:'rejected'},$unset:{isBlocked:''}})
    res.status(200).json({message:'Restaurant accepted successfully'})

  } catch (error) {    
    res.status(500).json({message:'Internal server error'})
  }
}

const filter= async(req,res)=>{

  const {value,role}=req.body
  let users;
  
  if(role==='user' || role==='agent'){

    let collection;

    switch (role) {
      case 'user':
        collection=userCollection
        break;
      case 'agent':
        collection=agentCollection
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    if(value==='blocked'){

      users = await collection.find({ isBlocked: true, role: { $ne: 'superAdmin' } });
    }else{

       users = await collection.find({isBlocked:false})
    }
  }else{

    if(value==='pending'){

       users = await restaurantCollection.find({signupStatus:'pending'})
    }else if(value === 'accepted'){

       users = await restaurantCollection.find({signupStatus:'accepted'})
    }else if(value==='rejected'){

       users = await restaurantCollection.find({signupStatus:'rejected'})
    }else if(value==='blocked'){

       users = await restaurantCollection.find({isBlocked:true})
    }else{

       users = await restaurantCollection.find({isBlocked:false})
    }
  }


  if (users.length > 0) {
    res.status(200).json({message:`${role} found`, filtered: users });
  } else {
    res.status(404).json({ message: 'No users found',role:role });
  }

}

module.exports = adminController = {getAll,search,blockUser,unBlockUser,makeAdmin,removeAdmin,getSpecificData,restaurantAccept,restaurantReject,filter}
