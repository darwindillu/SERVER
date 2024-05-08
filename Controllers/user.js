const bcrypt= require('bcrypt')
const userCollection = require('../Model/userSchema');
const tempUserCollection = require('../Model/tempUserSchema');
const jwt= require('jsonwebtoken')
const otpPage= require('../utils/otp');
const agentCollection = require('../Model/agentSchema');
const restaurantCollection = require('../Model/restaurantSchema');
const tempAgentCollection= require('../Model/agentTempSchema');
const tempRestCollection = require('../Model/tempRestSchema');
const menuCollection = require('../Model/menuItems')
const cartCollection = require('../Model/cart')

const postSignup = async (req, res) => {
  try {
    const { user, role } = req.body;

    let collection;
    let tempCollection;

    switch (role) {
      case 'user':
        collection = userCollection;
        tempCollection = tempUserCollection;
        break;
      case 'agent':
        collection = agentCollection;
        tempCollection = tempAgentCollection;
        break;
      default:
        throw new Error('Invalid role');
    }

    const emailCheck = await collection.findOne({ email: user.email });
    const mobileCheck = await collection.findOne({ mobile: user.mobile });

    if (emailCheck) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (mobileCheck) {
      return res.status(410).json({ message: 'Mobile number already registered' });
    }

    const tempEmailCheck = await tempCollection.findOne({ email: user.email });
    const tempMobileCheck = await tempCollection.findOne({ mobile: user.mobile });

    if (tempEmailCheck || tempMobileCheck) {
      return res.status(411).json({ message: 'Please try after some time' });
    }

    const hashedPassword = await bcrypt.hash(user.password.toString(), 10);
    const otp = otpPage.otp(user.email);

    const userData = {
      username: user.username.toLowerCase(),
      email: user.email,
      mobile: user.mobile,
      password: hashedPassword,
      otp: otp
    };

    await tempCollection.insertMany([userData]);
    
    res.status(200).json({ message: 'Signup successful! You can now log in.', data: user.email,role:role });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const postRestaurantSignup = async (req, res) => {
  try {
      const { user } = req.body;
      const email = await restaurantCollection.findOne({email:user.email})

      if(email){
          return res.status(409).json({message:'Email already registered'})
      }

      const email1 = await tempRestCollection.findOne({email:user.email})

      if(email1){
          return res.status(300).json({message:'Try after 10 minutes'})
      }

      const password = user.password.toString(); 
      const hashedPassword = await bcrypt.hash(password, 10);

      const otp = otpPage.otp(user.email)

      const restaurantData = {
          restaurantName: user.restaurantName.toLowerCase(),
          email: user.email,
          description:user.description,
          street:user.street,
          city:user.city,
          district:user.district,
          pincode:user.pincode,
          openingTime:user.openingTime,
          password: hashedPassword,
          otp:otp
      };

      await tempRestCollection.insertMany([restaurantData]);
      res.status(200).json({ message: 'Signup successful! You can now log in.',data:user.email });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};


const verifyOtp = async (req, res) => {
    try {
      const { otp, email,role } = req.body;
  
      if (!otp) {
        return res.status(400).json({ message: 'Missing OTP or email in request body' });
      }
      
      let collection;
      let tempCollection;

      switch (role) {
        case 'user':
          collection=userCollection;
          tempCollection=tempUserCollection
          break;
        case 'agent':
          collection=agentCollection;
          tempCollection=tempAgentCollection
          break;
        case 'restaurant':
          collection=restaurantCollection;
          tempCollection=tempRestCollection
          break;
        default:
          break;
      }
  
      const orgOtp = await tempCollection.findOne({ email:email });
      const user= await tempCollection.findOne({email:email},{otp:0})
  
      if (!orgOtp) {
        return res.status(400).json({ message: 'Email not found or invalid' });
      }
  
      const originalOtp = Number(orgOtp.otp);
      const enteredOtp = Number(otp);
  
      if (enteredOtp === originalOtp) {
        await collection.insertMany([user]); 
        await tempCollection.deleteOne({ email:orgOtp.email }); 
  
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
};

const resendOtp = async(req,res)=>{
  try{

    const {email,role}= req.body

    const otp = otpPage.otp(email)

    let tempCollection;

    switch (role) {
      case 'user':
        tempCollection=tempUserCollection
        break;
      case 'agent':
        tempCollection=tempAgentCollection
        break;
      case 'restaurant':
        tempCollection=tempRestCollection
        break;    
      default:
        break;
    }
 
    await tempCollection.updateOne({email:email},{$set:{otp:otp}})
    res.status(200).json({message:'OTP sented successfully',otp:otp})

  } catch(e) {
    res.status(500).json({message:'Internal server error'})
  }
}

const postLogin = async (req, res) => {
  try {
    const { user,role } = req.body;

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
      case 'admin':
        collection=userCollection
        break;
       default: 
        break;
    }
    const existingEmail = await collection.findOne({ email: user.email });

    if (!existingEmail) {
      return res.status(404).json({ message:'User Not Found' });
    }

    const enteredPassword = user.password;
    const passwordMatch = await bcrypt.compare(enteredPassword, existingEmail.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect Password' });
    }

    const payload = {
      userId: existingEmail._id,
      role:existingEmail.role 
    };
    const secretKey = process.env.SECRETKEY; 

    const token = await jwt.sign(payload, secretKey); 

    const id= existingEmail._id

    res.status(200).json({ message: 'User logged in successfully', token:token, role:existingEmail.role,id:id,status:existingEmail.signupStatus });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const verifyEmail= async(req,res)=>{
  try{
    const {email,role}=req.body

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
        break;
    }
    const emailExists= await collection.findOne({email:email})
  
    if(!emailExists){
      return res.status(404).json({message:'Email not found'})
    }
  
    const otp = otpPage.otp(emailExists.email)
  
    if(otp){
      await collection.updateOne({email:emailExists.email},{$set:{otp:otp}})
      res.status(200).json({message:'Email verified!',email:emailExists.email,role:role})
    }else{
      res.status(401).json({message:'OTP not sended'})
    }
  }catch(e){
    res.status(500).json({message:'internal server error'})
  }
}

const resetPassword= async(req,res)=>{
  try {
    const {otp,email,role}=req.body

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
        break;
    }
    const user= await collection.findOne({email:email})
    const orgOtp= Number(user.otp)

    if(otp===orgOtp){
      res.status(200).json({message:'Otp verified successfully'})
    }else{
      res.status(300).json({message:'OTP is not matching'})
    }

  } catch (error) {
    res.status(500).json({message:'Internal server error'})
  }
}

const postReset= async(req,res)=>{
  try{
    const {password,email,role}= req.body
  
    const hashedPassword= await bcrypt.hash(password,10)

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
        break;
    }
  
    await collection.updateOne({email:email},{$set:{password:hashedPassword}})

    res.status(200).json({message:'Password changed successfuly'})

  }catch (e) {
    res.status(500).json({message:'Internal server error'})
  }
}

const getMenu = async(req,res)=>{
  try {
    
    const {id} = req.body

    const menu = await menuCollection.find({restaurantId:id})
    const restaurant = await restaurantCollection.findOne({_id:id})
    res.status(200).json({menu:menu, restaurant:restaurant})
  } catch (error) {
    
    console.log(error);
  }
}

const addToCart = async(req,res)=>{
    
  const {userId,menuId} = req.body

  const menu = await menuCollection.findOne({_id:menuId})

  if(menu){
    const data = {
      itemName:menu.menuName,
      description:menu.description,
      price:menu.price,
      offer:menu.offer,
      category:menu.category,
      image:menu.image,
      restaurantId:menu.restaurantId,
      userId:userId,
      quantity:1,
      totalPrice:menu.price
    }

    await cartCollection.insertMany([data])
    res.status(200).json({message:'Item added successfully'})
  }else{
    res.status.json({message:'Something went wrong'})
  }
}

const getCart = async(req,res)=>{
  try {
    const {userId} = req.body

   const cartItems = await cartCollection.find({userId:userId})
   const cart = await cartCollection.find({userId:userId})
   const grandPrice = cart.reduce((total, item) => total + item.totalPrice, 0);

   return res.status(200).json({message:'Cart items successfully fetched',cartItems:cartItems,grandPrice:grandPrice})
  } catch (error) {
    console.log(error);
  }
   
}

const removeCart = async(req,res)=>{
  try {
    const {cartId} = req.body
    await cartCollection.deleteOne({_id:cartId})
   return res.status(200).json({message:'Item removed successfully'})

  } catch (error) {
    console.log(error);
  }
}

const updateQuantity = async(req,res)=>{
  try {

    const {id,quantity} = req.body
    const cartItem = await cartCollection.findOne({_id:id})
    let price = cartItem.price
    let renewedTotalPrice = price * quantity


    await cartCollection.updateOne(
      {_id:id},
      {quantity:quantity,
       totalPrice:renewedTotalPrice 
      })

      res.status(200).json({message:'Updated successfully'})

    
  } catch (error) {
    console.log(error);
  }
}

module.exports = userController = {postSignup,postRestaurantSignup,verifyOtp,resendOtp,postLogin,verifyEmail,resetPassword,postReset,getMenu,addToCart,getCart,removeCart,updateQuantity}