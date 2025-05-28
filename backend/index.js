const express = require('express')
const app = express()
const users = require('./routes/users')
const bugs = require('./routes/bugs')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.json())
app.use('/api/users', users)
app.use('/api/bugs', bugs)

mongoose.connect('mongodb://localhost/bugbase')
    .then(()=> console.log('Connected to mongoDB'))
    .catch((err)=> console.log(err))

const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
})