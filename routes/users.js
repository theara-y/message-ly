const express = require('express');
const User = require('../models/user');
const router = express.Router();
const {ensureLoggedIn} = require('../middleware/auth')
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async (req, res, next) => {
    const users = await User.all()
    return res.status(200).json(users);
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureLoggedIn, async (req, res, next) => {
    const user = await User.get(req.params.username);
    return res.status(200).json(user)
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureLoggedIn, async (req, res, next) => {
    const messages = await User.messagesTo(req.params.username);
    return res.status(200).json(messages)
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureLoggedIn, async (req, res, next) => {
    const messages = await User.messagesTo(req.params.username);
    return res.status(200).json(messages)
});
module.exports = router;