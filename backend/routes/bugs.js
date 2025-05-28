const express = require('express')
const router = express.Router()
const {Bug, validateBug} = require('../models/bug')
const AuthenticateUser = require('../middleware/auth')
const { default: mongoose } = require('mongoose')

router.post('/', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'user') {
        return res.status(403).send('Only users can create bugs')
    }

    const {error} = validateBug(req.body)
    if(error) {
        return res.status(400).send({message: error.details[0].message})
    }

    const bug = new Bug({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        reporter: req.user._id,
        isApproved: req.body.isApproved
    })

    await bug.save()
    res.status(201).send({message: 'Bug is reported successfully', bug})
})

router.get('/', AuthenticateUser, async(req,res)=>{
    let bugs

    if(req.user.role === 'admin') {
        bugs = await Bug.find().populate('reporter', 'username email')
    } else if(req.user.role === 'user') {
        bugs = await Bug.find({reporter: req.user._id}).populate('reporter', 'username email')
    } else {
        bugs = await Bug.find({isApproved: true}).populate('reporter', 'username email')
    }

    const result = bugs.map(bug=>{
        const showstatus = req.user.role === 'admin' || bug.reporter._id.equals(req.user._id)
        return{
            _id: bug._id,
            title: bug.title,
            description: bug.description,
            priority: bug.priority,
            reporter: bug.reporter,
            ...(showstatus ? { status: bug.status } : {}),
        }
    })

    res.send(result)
})
 
router.get('/:id', AuthenticateUser, async(req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({message: 'Invalid bug ID'})
    }

    const bug = await Bug.findById(req.params.id).populate('reporter', 'username email')
    if(!bug) {
        return res.status(404).send({message: 'Bug not found'})
    }
    const showStatus = req.user.role === 'admin' || bug.reporter._id.equals(req.user._id);
    const canView =
        req.user.role === 'admin' ||
        bug.reporter._id.equals(req.user._id) ||
        bug.isApproved;

    if (!canView) {
        return res.status(403).send({ message: 'Access denied' });
    }

    res.send({
        _id: bug._id,
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        reporter: bug.reporter,
        ...(showStatus ? { status: bug.status } : {})})
})

router.put('/:id/status', AuthenticateUser, async(req,res)=>{
    const {status} = req.body

    if(!['open', 'inprogress', 'closed'].includes(status)) {
        return res.status(400).send({message: 'Invalid status'})
    }

    const bug = await Bug.findById(req.params.id)
    if(!bug) {
        return res.status(404).send({message: 'No bug with the given ID'})
    }

    if((req.user.role === 'dev' || req.user.role === 'qa') && !bug.isApproved) {
        return res.status(403).send({message: 'Bug not approved by admin'})
    }

    if(req.user.role !== 'admin' && req.user.role !== 'dev' && req.user.role !== 'qa') {
        return res.status(403).send({message: 'Access denied'})
    }

    bug.status = status
    await bug.save()
    res.status(200).send({message: 'Bug status saved'})
})

router.put('/:id/approve', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'admin') {
        return res.status(403).send({message: 'Only admins can approve bugs'})
    }

    const bug = await Bug.findById(req.params.id)
    if(!bug) {
        res.status(403).send({message: 'No bug with given ID found'})
    }

    bug.isApproved = true
    await bug.save()
    res.send({message: 'Bug status saved'})
})

router.delete('/:id', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'admin') {
        return res.status(403).send({message: 'Only admins can delete a bug'})
    }

    const bug = await Bug.findByIdAndDelete(req.params.id)
    if(!bug) {
        return res.status(403).send({message: 'No bug with the given ID found'})
    }

    res.send({message: 'Bug not found'})
})
module.exports = router