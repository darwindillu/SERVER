const express = require('express')
const router = express()
const restaurantController = require('../Controllers/restaurant')
const restaurantToken= require('../middleware/token')
const upload = require('../utils/multer')


router.post('/getName',restaurantToken.isRestaurantAuth,restaurantController.getName)
router.post('/getData',restaurantToken.isRestaurantAuth,restaurantController.getData)
router.post('/edit',restaurantToken.isRestaurantAuth,restaurantController.editData)
router.post('/editImage',restaurantToken.isRestaurantAuth,upload.single('file'),restaurantController.editImage)
router.post('/addMenu',restaurantToken.isRestaurantAuth,upload.single('file'),restaurantController.addMenu)
router.post('/getLocation',restaurantToken.isRestaurantAuth,restaurantController.getLocation)
router.get('/getAgent',restaurantToken.isRestaurantAuth,restaurantController.getAgents)
router.post('/getMenu',restaurantToken.isRestaurantAuth,restaurantController.getMenu)
router.post('/editMenu',restaurantToken.isRestaurantAuth,upload.single('file'),restaurantController.editMenu)
router.post('/get-orders',restaurantToken.isRestaurantAuth,restaurantController.getOrders)
router.post('/update-reason',restaurantToken.isRestaurantAuth,restaurantController.updateReason)
router.post('/accept-order',restaurantToken.isRestaurantAuth,restaurantController.acceptOrder)
router.post('/filter-order',restaurantToken.isRestaurantAuth,restaurantController.filterOrders)
router.post('/assign-order',restaurantToken.isRestaurantAuth,restaurantController.assignOrder)
router.post('/pickup-order',restaurantToken.isRestaurantAuth,restaurantController.pickUp)
router.post('/get-reviews',restaurantToken.isRestaurantAuth,restaurantController.getReviews)







module.exports = router