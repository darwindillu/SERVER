const jwt = require('jsonwebtoken');
const userCollection = require('../Model/userSchema');
const agentCollection = require('../Model/agentSchema');
const restaurantCollection = require('../Model/restaurantSchema');

const refreshToken = async (req, res) => {
    try {
        const { refreshToken, role } = req.body;
        if (!refreshToken || !role) {
            return res.status(400).json({ message: 'Refresh token and role are required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESHKEY);

        let collection;
        switch (role) {
            case 'user':
                collection = userCollection;
                break;
            case 'agent':
                collection = agentCollection;
                break;
            case 'restaurant':
                collection = restaurantCollection;
                break;
            case 'admin':
            case 'superAdmin':
                collection = userCollection; // Assuming admin and superAdmin are in userCollection
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await collection.findById(decoded.userId).select('-password');
        if (!user || user.role !== role) {
            return res.status(401).json({ message: 'Invalid token or user not found' });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const newAccessToken = jwt.sign(payload, process.env.ACCESSKEY, { expiresIn: '15m' });
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

module.exports = { refreshToken };
