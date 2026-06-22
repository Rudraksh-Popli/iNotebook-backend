const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Create a User using: POST "/api/auth/createuser". No Login Required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password must be atleast 8 characters long').isLength({ min: 8 })
], async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Check whether a user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "A user with this e-mail already exists!" })
        }
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occurred");
    }
});

module.exports = router;