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
router.post('/addLocation',userController.addLocation)
router.post('/addBillAddress',userController.addBillingAddress)
router.post('/getAddress',userController.getAddress)
router.post('/deleteAddress',userController.deleteAddress)
router.post('/proceed',userController.proceed)
router.post('/razorpayOrder',userController.generateId)
router.post('/razorpay-success',userController.razorpaySuccess)
router.post('/get-profile-data',userController.getProfileData)
router.post('/get-orders',userController.getOrderData)
router.post('/add-wallet',userController.addWallet)
router.post('/change-password',userController.changePassword)
router.post('/edit-profile',userController.editProfile)
router.get('/search-restaurant/:item',userController.searchRestaurant)


module.exports = router;
