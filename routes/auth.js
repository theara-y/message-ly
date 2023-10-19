const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config');
const router = express.Router();
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    const {username, password} = req.body;
    const isSuccess = await User.authenticate(username, password)
    if (isSuccess) {
        const token = jwt.sign({username}, SECRET_KEY);
        return res.status(200).json({token});
    }
    return res.status(400).json({})
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    const user = await User.register(req.body);
    const token = jwt.sign({username: user.username}, SECRET_KEY)
    return res.status(200).json({user, token})
});
module.exports = router;
