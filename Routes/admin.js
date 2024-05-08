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
router.patch('/accept',jsonMiddleware.isAdminAuthenticated,adminController.restaurantAccept)
router.patch('/reject',jsonMiddleware.isAdminAuthenticated,adminController.restaurantReject)
router.post('/filter',jsonMiddleware.isAdminAuthenticated,adminController.filter)


module.exports = router;