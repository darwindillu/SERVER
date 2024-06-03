const express = require('express');
const router = express.Router();
const createAccess = require('../middleware/refresh')

router.post('/refresh-token',createAccess.refreshToken)

module.exports  = router