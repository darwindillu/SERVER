const jwt = require('jsonwebtoken');
const userCollection = require('../Model/userSchema');
const restaurantCollection = require('../Model/restaurantSchema');
const agentCollection = require('../Model/agentSchema');

const authenticate = (role, collection) => {
  return async (req, res, next) => {
    try {
      let header = req.headers['authorization']
      let token = header.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.ACCESSKEY);
        const user = await collection.findById(decoded.userId).select('-password');

        if (!user || (role && user.role !== role)) throw new Error('Invalid token or role mismatch');
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: "Not authorized, no token provided" });
      }
    } catch (error) {
      res.status(402).json({ message: "Not authorized, please login" });
    }
  };
};

const isAdminAuthenticated = authenticate('superAdmin', userCollection);
const isRestaurantAuth = authenticate('restaurant', restaurantCollection);
const isAgentAuth = authenticate('agent', agentCollection);
const isUserAuth = authenticate('user', userCollection);

module.exports = { isAdminAuthenticated, isRestaurantAuth, isAgentAuth, isUserAuth };
