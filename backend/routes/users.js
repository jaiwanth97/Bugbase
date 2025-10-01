const express = require('express');
const router = express.Router();
const { User, validateLogin, validateRegister } = require('../models/user');
const bcrypt = require('bcrypt');
const TOKEN = process.env.ACCESS_TOKEN_SECRET;
const jwt = require('jsonwebtoken')
const AuthenticateUsers = require('../middleware/auth')

router.post('/register', async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { email, username, password, role } = req.body;

  try {
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).send({ message: 'User with the given email already exists' });
    }

    const userName = await User.findOne({ username });
    if (userName) {
      return res.status(400).send({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hash,
      role: role || 'user' // Default role is 'user'
    });

    await user.save();

    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server issue' });
  }
});

router.post('/login', async(req,res)=>{
    const {error} = validateLogin(req.body)
    if(error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).send({message: error.details[0].message})
    }

    const {email, password} = req.body
    console.log('Login attempt for email:', email);

    try{
        const user = await User.findOne({email})
        if(!user) {
            console.log('User not found for email:', email);
            return res.status(400).send({message: 'Invalid email or password'})
        }

        const ValidPass = await bcrypt.compare(password, user.password)
        if(!ValidPass) {
            console.log('Invalid password for email:', email);
            return res.status(400).send({message: 'Invalid email or password'})
        }

        const token = jwt.sign({
            _id: user._id, 
            role: user.role, 
            username: user.username,
            email: user.email
        }, TOKEN)

        console.log('Login successful for:', email);
        res.send({token, user: { 
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }})
    }catch(err) {
        console.error('Login error:', err)
        return res.status(500).send({message: 'Server issue'})
    }
})


router.get('/me', AuthenticateUsers, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).select('-password')
        if(!user) {
            return res.status(404).send({message: 'User not found'})
        }

        res.send({user})
    }catch(err) {
        console.error(err)
        return res.status(500).send({message: 'Server issue'})
    }
})

// Add this route after existing routes
router.put('/role/:userId', AuthenticateUsers, async(req, res) => {
    if(req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Only admins can update roles' });
    }

    const allowedRoles = ['admin', 'dev', 'qa', 'user'];
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
        return res.status(400).send({ message: 'Invalid role' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send({ user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server issue' });
    }
});

// Add route to get all developers
router.get('/developers', AuthenticateUsers, async(req, res) => {
    try {
        const developers = await User.find({ role: 'dev' })
            .select('username email');
        res.send(developers);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server issue' });
    }
});

module.exports = router;