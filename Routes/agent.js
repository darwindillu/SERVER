const express = require('express')
const router = express()
const agentController = require('../Controllers/agent')
const agentToken = require('../middleware/token')

router.post('/location',agentToken.isAgentAuth,agentController.location)
router.get('/getRestaurants',agentToken.isAgentAuth,agentController.getRestaurants)

module.exports = router