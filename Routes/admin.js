const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/admin');
const jsonMiddleware = require('../middleware/token')

router.post('/getAll',adminController.getAll);
router.post('/search',jsonMiddleware.isAdminAuthenticated,adminController.search)
router.patch('/block',jsonMiddleware.isAdminAuthenticated,adminController.blockUser)
router.patch('/unblock',jsonMiddleware.isAdminAuthenticated,adminController.unBlockUser)
router.patch('/makeAdmin',jsonMiddleware.isAdminAuthenticated,adminController.makeAdmin)
router.patch('/removeAdmin',jsonMiddleware.isAdminAuthenticated,adminController.removeAdmin)
router.post('/getData',jsonMiddleware.isAdminAuthenticated,adminController.getSpecificData)
router.patch('/accept',adminController.restaurantAccept)
router.patch('/reject',jsonMiddleware.isAdminAuthenticated,adminController.restaurantReject)
router.get('/get-orders',adminController.getOrders)
router.get('/get-menu',adminController.getMenu)
router.get('/overall-details',adminController.details)
router.post('/download-report',adminController.download)
router.post('/filter',adminController.filter)
router.post('/search-menu',adminController.searchMenus)
router.post('/search-orders',adminController.searchOrders)
router.post('/get-order-details',adminController.getOrderDetails)

module.exports = router;