const agentCollection = require('../Model/agentSchema')
const restaurantCollection = require('../Model/restaurantSchema')
const userCollection = require('../Model/userSchema')
const orderCollection = require('../Model/orderSchema')
const menuCollection = require('../Model/menuItems')
const PDFDocument = require('pdfkit')

const getAll= async(req,res)=>{
  try{
    console.log('hiiii admin');
    const {role} = req.body
    console.log(role);
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
      case 'orders':
        collection=orderCollection
        break;
      case 'menu':
        collection=menuCollection
        break;  
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users= await collection.find({role:{$ne:'admin'}})
    console.log(users);
  
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

const getOrders = async(req,res)=>{
  try {
    
    const orders = await orderCollection.find()
    res.status(200).json({message:'fetched',orders})
  } catch (error) {
    console.log(error);
  }
}

const getMenu = async(req,res)=>{
  try {
    
    const menu = await menuCollection.find()
    res.status(200).json({message:'fetched',menu})
  } catch (error) {
    console.log(error);
  }
}

const details = async (req, res) => {
  try {
    const orders = await orderCollection.find();

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const rejectedOrders = orders.filter(order => order.status === 'rejected').length;

    const totalRevenue = orders.reduce((total, order) =>
      order.status === 'delivered' ? total + order.orderTotal : total, 0
    );

    const totalUsers = await userCollection.countDocuments();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDate = new Date();

    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - currentDate.getDay());
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + (6 - currentDate.getDay()));

    const orderDays = await orderCollection.find({ orderDate: { $gte: startDate, $lte: endDate } });

    const ordersByDay = orderDays.reduce((acc, order) => {
      const dayIndex = order.orderDate.getDay();
      const dayOfWeek = daysOfWeek[dayIndex];
      acc[dayOfWeek] = acc[dayOfWeek] ? acc[dayOfWeek] + 1 : 1;
      return acc;
    }, {});

    const data = daysOfWeek.map(day => {
      const orderCount = ordersByDay[day] || 0;
      return { label: day, y: orderCount };
    });

    const revenueData = {
      2023: await getMonthlyRevenue(2023),
      2024: await getMonthlyRevenue(2024)
    };

    res.status(200).json({
      totalOrders,
      deliveredOrders,
      rejectedOrders,
      totalRevenue,
      totalUsers,
      data: data,
      revenueData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getMonthlyRevenue = async (year) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const orders = await orderCollection.find({
    orderDate: { $gte: startOfYear, $lte: endOfYear },
    status: 'delivered'
  });

  const revenueByMonth = orders.reduce((acc, order) => {
    const month = order.orderDate.getMonth();
    acc[month] = (acc[month] || 0) + order.orderTotal;
    return acc;
  }, {});

  return months.map((month, index) => ({
    label: month,
    y: revenueByMonth[index] || 0
  }));
};

const download = async (req, res) => {
  try {
    const { report } = req.body;

    const currentDate = new Date(Date.now());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    let startDate, endDate;

    if (report === 'daily') {
      startDate = new Date(year, month - 1, day, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59);
    } else if (report === 'monthly') {
      startDate = new Date(year, month - 1, 1, 0, 0, 0);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      res.status(400).send('Invalid report type');
      return;
    }

    const orders = await orderCollection.find({
      orderDate: { $gte: startDate, $lte: endDate }
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const rejectedOrders = orders.filter(order => order.status === 'rejected').length;
    const totalRevenue = orders.reduce((total, order) =>
      order.status === 'delivered' ? total + order.orderTotal : total, 0
    );

    const totalUsers = await userCollection.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const doc = new PDFDocument();
    let fileName = '';

    if (report === 'daily') {
      fileName = `sales_report_${formattedDate}.pdf`;
      doc.fontSize(16).text(`Daily Sales Report for ${formattedDate}`, { align: 'center' });
    } else if (report === 'monthly') {
      fileName = `sales_report_${month}.pdf`;
      doc.fontSize(16).text(`Yearly Sales Report for ${month}`, { align: 'center' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    doc.pipe(res);

    doc.fontSize(14).text(`Total Orders: ${totalOrders}`);
    doc.fontSize(14).text(`Total Delivered: ${deliveredOrders}`);
    doc.fontSize(14).text(`Total Rejected: ${rejectedOrders}`);
    doc.fontSize(14).text(`Total Revenue: \u20B9${totalRevenue}`);
    doc.fontSize(14).text(`Total Users: ${totalUsers}`);
    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const searchMenus = async (req, res) => {
  try {
    const { item } = req.body;
    
    if (!item || typeof item !== 'string') {
      return res.status(400).json({ message: 'Invalid search item' });
    }

    console.log(item);

    const menu = await menuCollection.find({ menuName: { $regex: new RegExp(`^${item}`, 'i') } });
    console.log(menu);

    res.status(200).json({ message: 'fetched', menu });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const searchOrders = async (req, res) => {
  try {
    const { item } = req.body;
    
    if (!item || typeof item !== 'string') {
      return res.status(400).json({ message: 'Invalid search item' });
    }

    console.log(item);

    const orders = await orderCollection.find({ _id:item });
    console.log(orders);

    res.status(200).json({ message: 'fetched', orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getOrderDetails = async (req, res)=>{
  try {
    
    const {type,id} = req.body

    let data;
    let items;

    if(type==='order'){

      data = await orderCollection.findOne({_id:id})
      items=data.items
      console.log(items);
    }else if(type==='restaurant'){

      data = await restaurantCollection.findOne({_id:id})

    }else{

      data = await userCollection.findOne({_id:id})
    }
    console.log(data);
    res.status(200).json({message:'fetched',data,items})
  }catch (error) {
    console.log(error);
  }
}



module.exports = adminController = {getAll,getOrderDetails,search,blockUser,unBlockUser,searchOrders,searchMenus,makeAdmin,removeAdmin,getSpecificData,restaurantAccept,restaurantReject,filter,getOrders,getMenu,details,download}
