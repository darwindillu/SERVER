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
router.post('/editMenu',restaurantToken.isRestaurantAuth,restaurantController.editMenu)

module.exports = router