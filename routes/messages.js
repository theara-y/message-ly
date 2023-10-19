const express = require('express');
const router = express.Router();
const {ensureLoggedIn} = require('../middleware/auth');
const User = require('../models/user');
const Message = require('../models/message')
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id)
        if (message.to_user.username === req.user.username
        || message.from_user.username == req.user.username) {
            return res.status(200).json(message);
        }
        return next({status: 404, message: 'Not Found'})
    } catch(err) {
        return next(err);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    const { to_username, body } = req.body;
    try {
        const message = await Message.create({
            from_username: req.user.username,
            to_username,
            body
        });
        return res.status(200).json(message);
    } catch(err) {
        return next(err)
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id)
        if (message.to_user.username === req.user.username) {
            const response = await Message.markRead(req.params.id)
            return res.status(200).json(response);
        }
        return next({status: 401, message: 'Unauthorized'})
    } catch(err) {
        return next(err);
    }
});

module.exports = router;