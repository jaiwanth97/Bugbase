require('dotenv').config()
console.log('TOKEN Secret exists:', !!process.env.ACCESS_TOKEN_SECRET)

const express = require('express')
const cors = require('cors')
const app = express()
const users = require('./routes/users')
const bugs = require('./routes/bugs')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.json())
app.use('/api/users', users)
app.use('/api/bugs', bugs)

mongoose.connect('mongodb+srv://jaiwanth97_db_user:Postbox97@bugbase.mkntsks.mongodb.net/?retryWrites=true&w=majority&appName=Bugbase')
    .then(()=> console.log('Connected to mongoDB'))
    .catch((err)=> console.log(err))

const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
})