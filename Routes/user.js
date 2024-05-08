const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user');
const userToken = require('../middleware/token')

router.post('/signup', userController.postSignup);
router.post('/restaurantSignup', userController.postRestaurantSignup);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp)
router.post('/postLogin',userController.postLogin)
router.post('/verifyEmail',userController.verifyEmail)
router.post('/reset',userController.resetPassword)
router.post('/postReset',userController.postReset)
router.post('/getMenu',userController.getMenu)
router.post('/addToCart',userController.addToCart)
router.post('/getCart',userController.getCart)
router.post('/removeCart',userController.removeCart)
router.post('/updateCart',userController.updateQuantity)

module.exports = router;
