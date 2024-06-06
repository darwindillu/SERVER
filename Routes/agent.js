const express = require('express')
const router = express()
const agentController = require('../Controllers/agent')
const agentToken = require('../middleware/token')

router.post('/location',agentToken.isAgentAuth,agentController.location)
router.get('/getRestaurants',agentToken.isAgentAuth,agentController.getRestaurants)
router.post('/ordersLists',agentToken.isAgentAuth,agentController.orders)
router.post('/acceptOrder',agentToken.isAgentAuth,agentController.acceptOrder)
router.post('/reject-order',agentToken.isAgentAuth,agentController.rejectOrder)
router.post('/pick-orders',agentToken.isAgentAuth,agentController.pickOrder)
router.post('/deliver-orders',agentToken.isAgentAuth,agentController.deliverOrder)
router.post('/filter-orders',agentToken.isAgentAuth,agentController.filteredOrders)

module.exports = router