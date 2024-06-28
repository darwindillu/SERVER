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
const billingCollection = require('../Model/billingModel');
const orderCollection = require('../Model/orderSchema');
const env = require('dotenv').config()
const Razorpay = require('razorpay')
const reviewCollection = require('../Model/reviewSchema')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAYKEY,
  key_secret: process.env.RAZORPAYID
})


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
      const { user,latitude,longitude } = req.body;
      console.log(latitude,longitude);
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
          latitude:latitude,
          longitude:longitude,
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
    const existingEmail = await collection.findOne({ email: user.email,role:role });

    if (!existingEmail) {
      return res.status(404).json({ message:'User Not Found' });
    }

    const enteredPassword = user.password;
    const passwordMatch = await bcrypt.compare(enteredPassword, existingEmail.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect Password',role:role });
    }

    const payload = {
      userId: existingEmail._id,
      role:existingEmail.role 
    };
    const accessSecretKey = process.env.ACCESSKEY; 
    const refreshSecretKey = process.env.REFRESHKEY

    const accessToken = await jwt.sign(payload, accessSecretKey,{expiresIn:'15m'}); 
    const refreshToken = await jwt.sign(payload,refreshSecretKey,{expiresIn:'2d'})

    const id= existingEmail._id

    res.status(200).json({ message: 'User logged in successfully',accessToken,refreshToken, role:existingEmail.role,id:id,status:existingEmail.signupStatus });
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

const getMenu = async (req, res) => {
  try {
    const { id, page } = req.body;
    const limit = 10; 
    const skip = (page - 1) * limit;

    const menu = await menuCollection.find({ restaurantId: id }).skip(skip).limit(limit);
    const restaurant = await restaurantCollection.findOne({ _id: id });
    const restaurantName = restaurant.restaurantName.toUpperCase()
    const district = restaurant.district.toUpperCase()
    const totalCount = await menuCollection.countDocuments({ restaurantId: id });

    res.status(200).json({ menu, restaurant, totalCount,restaurantName,district });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const addToCart = async(req,res)=>{
    
  const {userId,menuId} = req.body

  const menu = await menuCollection.findOne({_id:menuId})

  if(menu){
    const data = {
      menuId:menuId,
      itemName:menu.menuName,
      description:menu.description,
      price:menu.price,
      offer:menu.offer,
      category:menu.category,
      image:menu.image,
      restaurantId:menu.restaurantId,
      userId:userId,
      quantity:1,
      totalPrice:menu.price,
      restId:menu.restaurantId
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

   const user = await userCollection.findById(userId)

   return res.status(200).json({message:'Cart items successfully fetched',cartItems:cartItems,grandPrice:grandPrice,user:user})
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

const addLocation = async(req,res)=>{
  try {
    
    const {latitude,longitude,userId} = req.body

    await userCollection.findOneAndUpdate({_id:userId},{latitude:latitude,longitude:longitude})

    res.status(200).json({message:'Location fetched successfully'})

  } catch (error) {
    console.log(error);
  }
}

const addBillingAddress = async(req,res)=>{
  try {
    const {userId,billingAddress} = req.body

    const billingData = {
      firstName:billingAddress.firstName,
      lastName:billingAddress.lastName,
      email:billingAddress.email,
      mobile:billingAddress.mobile,
      address:billingAddress.address,
      userId:userId
    }

    await billingCollection.insertMany([billingData])

    res.status(200).json({message:'Billing address updated successfully'})
  } catch (error) {
    
  }
}

const getAddress = async(req,res)=>{
  try {
    
    const {userId} = req.body

    const billingData = await billingCollection.find({userId:userId})
    res.status(200).json({message:'Billing address updated successfully',billingData})

  } catch (error) {
    console.log(error);
  }
}

const deleteAddress = async(req,res)=>{
  try {
    
    const {Id} = req.body
    await billingCollection.deleteOne({_id:Id})
    res.status(200).json({message:'Deleted successfully'})
  } catch (error) {
    console.log(error);
  }
}

const proceed = async(req,res)=>{
  try {
    
    const {userId,addressId,total,method} = req.body
    const cartItems = await cartCollection.find({userId:userId})
    const user = await userCollection.findById(userId)
    
    
    const items = cartItems.map(item=>({
      menuId:item.menuId,
      menuName:item.itemName,
      image:item.image,
      quantity:item.quantity,
      price:item.price,
      totalPrice:item.totalPrice,
      restId:item.restId
      })
    )
    const restauarant = await restaurantCollection.findById(items[0].restId)
    console.log(restauarant);

    if(method === 'cashOnDelivery'){

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const seconds = currentDate.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      let formattedHours = hours % 12;
      formattedHours = formattedHours ? formattedHours : 12; 

      const formattedDate = `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
      console.log(formattedDate);

      const orderData = {
        userId:userId,
        addressId:addressId,
        items:items,
        orderTotal:total,
        paymentMethod:method,
        userLatitude:user.latitude,
        userLongitude:user.longitude,
        orderDate:formattedDate,
        restId:items[0].restId,
        restName:restauarant.restaurantName,
        userEmail:user.email,
        userName:user.username,
        userMobile:user.mobile,
        restImage:restauarant.profile
      }
      console.log(orderData);
  
     await orderCollection.insertMany([orderData])
     await cartCollection.deleteMany({userId:userId})
     res.status(200).json({message:'Order placed successfully'})

    }else if(method === 'walletPayment'){

       const wallet = await userCollection.findOne({_id:userId})

       const walletBalance = wallet.walletBalance

       if(walletBalance < total || walletBalance === undefined){
         return res.status(300).json({message:'Insufficient Balance'})
       }

       const currentDate = new Date();
       const year = currentDate.getFullYear();
       const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
       const day = currentDate.getDate().toString().padStart(2, '0');
       const hours = currentDate.getHours().toString().padStart(2, '0');
       const minutes = currentDate.getMinutes().toString().padStart(2, '0');
       const seconds = currentDate.getSeconds().toString().padStart(2, '0');
       const ampm = hours >= 12 ? 'PM' : 'AM';

       let formattedHours = hours % 12;
       formattedHours = formattedHours ? formattedHours : 12; 

       const formattedDate = `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
       console.log(formattedDate);

       const orderData = {
        userId:userId,
        addressId:addressId,
        items:items,
        orderTotal:total,
        paymentMethod:method,
        userLatitude:user.latitude,
        userLongitude:user.longitude,
        orderDate:formattedDate,
        restId:items[0].restId,
        restName:restauarant.restaurantName,
        userEmail:user.email,
        userName:user.username,
        userMobile:user.mobile,
        restImage:restauarant.profile
       }

       await orderCollection.insertMany([orderData])

       const updatedWalletBalance = walletBalance - total

       const item = cartItems.map(item=>({
        menuId:item.menuId,
        menuName:item.itemName
       })
      )
      
      await userCollection.findOneAndUpdate(
        {_id:userId},
        {$set:{walletBalance:updatedWalletBalance,walletHistory:item}})

      await cartCollection.deleteMany({userId:userId})
      
      res.status(200).json({message:'Order placed successfully'})
       
    }
  } catch (error) {
    console.log(error);
  }
}

const generateId = async(req,res)=>{
  try {
    
    const {total} = req.body

    const options = {
      amount: total * 100,
      currency: 'INR',
    };

    razorpay.orders.create(options, function (err, order) {
      if (err) {
        res.status(500).json({ error: 'Razorpay order creation failed' });
      } else {
        res.status(200).json({ order });
      }

    });
  } catch (error) {
    
  }
}

const razorpaySuccess = async(req,res)=>{
  try {
    const {data,userId,addressId,total,method} = req.body

    const paymentDetails = await razorpay.payments.fetch(data.razorpay_payment_id)

    if(paymentDetails.status === 'captured'){

      const cartItems = await cartCollection.find({userId:userId})
      const user = await userCollection.findById(userId)

      const items = cartItems.map(item=>({
        menuId:item.menuId,
        menuName:item.itemName,
        image:item.image,
        quantity:item.quantity,
        price:item.price,
        totalPrice:item.totalPrice,
        restId:item.restId
        })
      )

      const restaurant = await restaurantCollection.findById(items[0].restId)

        const currentDate = new Date();
       const year = currentDate.getFullYear();
       const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
       const day = currentDate.getDate().toString().padStart(2, '0');
       const hours = currentDate.getHours().toString().padStart(2, '0');
       const minutes = currentDate.getMinutes().toString().padStart(2, '0');
       const seconds = currentDate.getSeconds().toString().padStart(2, '0');
       const ampm = hours >= 12 ? 'PM' : 'AM';

       let formattedHours = hours % 12;
       formattedHours = formattedHours ? formattedHours : 12; 

       const formattedDate = `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
       console.log(formattedDate);

      const orderData = {
        userId:userId,
        addressId:addressId,
        items:items,
        orderTotal:total,
        paymentMethod:method,
        paymentId:data.razorpay_payment_id,
        userLatitude:user.latitude,
        userLongitude:user.longitude,
        orderDate:formattedDate,
        restId:items[0].restId,
        restName:restaurant.restaurantName,
        userEmail:user.email,
        userName:user.username,
        userMobile:user.mobile,
        restImage:restaurant.profile
       }

       await orderCollection.insertMany([orderData])
       await cartCollection.deleteMany({userId:userId})

       res.status(200).json({message:'Order placed successfully'})
    }else{
      res.status(300).json({message:'Order not placed'})
    }
  } catch (error) {
    console.log(error);
  }
}

const getProfileData = async(req,res)=>{
  try {
    
    const {userId} = req.body

    const userData = await userCollection.findById(userId)

    res.status(200).json({message:'successfully fetched',userData:userData})

  } catch (error) {
    console.log(error);
  }
}

const getOrderData = async(req,res)=>{
  try {
    const {userId} =req.body

    const orderData = await orderCollection.find({userId:userId})

    res.status(200).json({message:'successfully fetched',orderData:orderData})
  } catch (error) {
    console.log(error);
  }
}

const addWallet = async(req,res)=>{
  try {
    const {options,userId} = req.body
    const amount = parseInt(req.body.amount)

    const paymentDetails = await razorpay.payments.fetch(options.razorpay_payment_id)

    if(paymentDetails.status === 'captured'){

      const userData = await userCollection.findById(userId)

      const wallet = parseInt(userData.walletBalance)

      const updatedWalletBalance = parseInt(wallet + amount)

      await userCollection.findOneAndUpdate({_id:userId},{$set:{walletBalance:updatedWalletBalance}})

      res.status(200).json({message:'Amount added successfully'})

    }else{

      res.status(300).json({message:'something went wrong'})
    }
  } catch (error) {

    console.log(error);
  }
}

const changePassword = async(req,res)=>{
  try {
    const {userId,oldPassword,newPassword} = req.body

    const user = await userCollection.findById(userId)

    const password = user.password
    const comparedPassword = await  bcrypt.compare(oldPassword,password)

    if(!comparedPassword){
      res.status(300).json({message:'Password is invalid'})
      return
    }

    if(oldPassword === newPassword){
      res.status(301).json({message:'must be unique'})
      return 
    }

    const hashedPassword = await  bcrypt.hash(newPassword,10)

    await userCollection.findOneAndUpdate({_id:userId},{password:hashedPassword})
    res.status(200).json({message:'password changed successfully'})

  } catch (error) {
    console.log(error);
  }
}

const editProfile = async(req,res)=>{
  try {
    const {userId,username} = req.body

    await userCollection.findOneAndUpdate({_id:userId},{$set:{username:username}})

    res.status(200).json({message:'Profile updated'})

  } catch (error) {
    console.log(error);
  }
}

const searchRestaurant = async(req,res)=>{
  try {
    const {item} = req.params
    
    const searchItem = item.toLowerCase()

    const restaurants = await restaurantCollection.find(
      { restaurantName: { $regex: new RegExp(`^${searchItem}`, 'i') } },
      { password: 0 }
    );

    res.status(200).json({message:'fetched',restaurants})
  } catch (error) {
    console.log(error);
  }
}

const addReview = async(req,res)=>{
  try {
    
    const {id,review,role,userId} = req.body

    const user = await userCollection.findById(userId)

    if(role==='restaurant'){

      const reviews = await reviewCollection.find({userId:userId,roleRestaurant:1})
      console.log(reviews);

      if(reviews.length!==0){
        return res.status(300).json({message:'Already reviewed'})
      }
      

      const data = {
        restId:id,
        review:review,
        userId:userId,
        userName:user.username.toUpperCase(),
        userEmail:user.email,
        userMobile:user.mobile,
        roleRestaurant:true
      }

      await reviewCollection.insertMany([data])
    }

    if(role==='agent'){
      
      const reviews = await reviewCollection.find({userId:userId,roleAgent:1})
      console.log(reviews);

      if(reviews.length!==0){
        return res.status(300).json({message:'Already reviewed'})
      }

      const data = {
        agentId:id,
        review:review,
        userId:userId,
        userName:user.username.toUpperCase(),
        userEmail:user.email,
        userMobile:user.mobile,
        roleAgent:true
      }

      await reviewCollection.insertMany([data])
    }

    res.status(200).json({message:'review added successfully'})

  } catch (error) {
    console.log(error);
  }
 }

module.exports = userController = {postSignup,postRestaurantSignup,verifyOtp,resendOtp,postLogin,verifyEmail,resetPassword,postReset,getMenu,addToCart,getCart,removeCart,updateQuantity,addLocation,addBillingAddress,getAddress,deleteAddress,proceed,generateId,razorpaySuccess,getProfileData,getOrderData,addWallet,changePassword,editProfile,searchRestaurant,addReview}