const express = require('express')
const bcrypt = require("bcryptjs")
const router = express.Router()
var jwt = require("jsonwebtoken")
const fetchuser = require("../middleware/fetchuser")
const User = require("../models/user")
const { body, validationResult } = require("express-validator")
const JWT_SECRET = "wfdfsdfdsf"
const JWT_SECRET1 = "wfdfsewewrewrwerwedfdsf"
router.post("/creatuser", [
    body('email', 'enter invalid email').isEmail(),
    body('name', 'adsad').isLength({ min: 5 }),
    body('password', 'password').isLength({ min: 5 }),
    body('name1', 'String').isLength({ min: 5 }),
    body('password1', 'password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(450).json({ errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: 'sorrt a user with this email already exist' })
        }
        const salt = await bcrypt.genSalt(10);
        const sepass = await bcrypt.hash(req.body.password, salt);
        const sepass1 = await bcrypt.hash(req.body.password1, salt);
        console.log(req.body.name1)
        user = await User.create({
            name: req.body.name,
            password: sepass,
            email: req.body.email,
            name1: req.body.name1,
            password1: sepass1
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const data1 = {
            user1: {
                id1: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        const authtoken1 = jwt.sign(data1, JWT_SECRET1)
        res.json({ authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send("some error occured")
    }
}
)
//authenticateuser
router.post('/login', [
    body('name', 'enter invalid name').exists(),
    body('password', 'incorrect password').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, password } = req.body;
    try {
        let user = await User.findOne({ name });
        if (!user) {
            // If user not found by 'name', try finding by 'name1'
            user = await User.findOne({ name1: name }); // corrected the reference to name1
            console.log(user)
            if (!user) {
                return res.status(400).json({ error: "please try again" });
            }
        }
        const passcomp = await bcrypt.compare(password, user.password);
        if (!passcomp) {
            const passcomp = await bcrypt.compare(password, user.password1);
            if (passcomp && user) {
                const data = {
                    user: {
                        id: user.id
                    }
                };
                var authtoken1 = jwt.sign(data, JWT_SECRET1);
            }
            if (!user) {
                return res.status(400).json({ error: "please try again" });
            }
        }
        const data = {
            user: {
                id: user.id
            }
        };
        if (authtoken1) {
            let success = true;
            res.json({ success, authtoken1 });
        }
        else if (!authtoken1) {
            const authtoken = jwt.sign(data, JWT_SECRET);
            let success = true;
            res.json({ success, authtoken });
        } // corrected the variable name
    } catch (error) {
        console.error(error.message);
        let success = false;
        res.status(400).json({ success, error: "server error" });
    }
});

//rotes 3 get logged in user detial
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(400).send("server error")
    }
})

module.exports = router