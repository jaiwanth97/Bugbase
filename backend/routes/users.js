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

  const { email, username, password } = req.body;

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
      password: hash
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
        return res.status(400).send({message: error.details[0].message})
    }

    const {email, password} = req.body

    try{
        
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).send({message: 'Invalid email or password'})
        }

        const ValidPass = await bcrypt.compare(password, user.password)
        if(!ValidPass) {
            return res.status(400).send({message: 'Invalid email or password'})
        }

        const token = jwt.sign({
            _id: user._id, role: user.role, username: user.username
        }, TOKEN)

        res.send({token})
    }catch(err) {
        console.error(err)
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

module.exports = router;
