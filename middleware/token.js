const jwt = require('jsonwebtoken');
const userCollection = require('../Model/userSchema');
const restaurantCollection = require('../Model/restaurantSchema');
const agentCollection = require('../Model/agentSchema');

 const isAdminAuthenticated = async (req, res, next) => {
    let token;
    token = req.headers.authorization;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRETKEY);
            req.admin = await userCollection.findById(decoded.userId).select('-password');
            if (req.admin.role === 'superAdmin' || req.admin.role==='admin' || req.admin.role==='user'){
              
                next();
            }else{

                throw new Error('invalid token');
            } 
        } catch (error) {
            res.status(401);
            throw new Error("not authorized, incorrect jwt");
        }
    } else {
        res.status(402);
        throw new Error("not authorized, please login");
    }
};

const isRestaurantAuth= async(req,res,next)=>{

    let token;
    token = req.headers.authorization;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRETKEY);
            req.restaurant = await restaurantCollection.findById(decoded.userId).select('-password');
            if (req.restaurant.role !=='restaurant') throw new Error('invalid token');
            next();
        } catch (error) {
            res.status(401);
            throw new Error("not authorized, incorrect jwt");
        }
    } else {
        res.status(402);
        throw new Error("not authorized, please login");
    }
}

const isAgentAuth = async(req,res,next)=>{

    let token;
    token = req.headers.authorization;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRETKEY);
            req.agent = await agentCollection.findById(decoded.userId).select('-password');
            if (req.agent.role !=='agent') throw new Error('invalid token');
            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error("not authorized, incorrect jwt");
        }
    } else {
        res.status(402);
        throw new Error("not authorized, please login");
    }
}



module.exports = jasonMiddleware = {isAdminAuthenticated,isRestaurantAuth,isAgentAuth} 
