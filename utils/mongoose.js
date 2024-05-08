const mongoose= require('mongoose')
const cron = require('node-cron')
const tempUserCollection = require('../Model/tempUserSchema')
const tempRestCollection = require('../Model/tempRestSchema');
const agentTempCollection= require('../Model/agentTempSchema')

mongoose.connect('mongodb://127.0.0.1:27017/QuickBite')
.then(()=>{
   console.log('DB Connected QuickBite')
})
.catch((err)=>{
    console.log(err);
}) 

cron.schedule('*/10 * * * *', async () => {
    try {
        const toDelete= new Date(Date.now() - 2 * 60 * 1000);
        await tempUserCollection.deleteMany({createdAt:{$lt:toDelete}});
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' 
});  

cron.schedule('*/10 * * * *', async () => {
    try {
        const toDelete= new Date(Date.now() - 2 * 60 * 1000);
        await tempRestCollection.deleteMany({createdAt:{$lt:toDelete}});
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' 
});  

cron.schedule('*/10 * * * *', async () => {
    try {
        const toDelete= new Date(Date.now() - 2 * 60 * 1000);
        await agentTempCollection.deleteMany({createdAt:{$lt:toDelete}});
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata' 
}); 

module.exports 